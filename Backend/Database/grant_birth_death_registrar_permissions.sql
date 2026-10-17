SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @grants TABLE (
  role_code VARCHAR(50),
  role_name VARCHAR(100),
  permission_code VARCHAR(50)
);
INSERT INTO @grants (role_code, role_name, permission_code)
VALUES
  ('BIRTH_REGISTRAR', 'Birth Registrar', 'BIRTH_VIEW'),
  ('BIRTH_REGISTRAR', 'Birth Registrar', 'BIRTH_CREATE'),
  ('DEATH_REGISTRAR', 'Death Registrar', 'DEATH_VIEW'),
  ('DEATH_REGISTRAR', 'Death Registrar', 'DEATH_CREATE');

IF EXISTS (
  SELECT 1
  FROM @grants g
  LEFT JOIN dbo.permissions p ON p.permission_code = g.permission_code
  WHERE p.permission_id IS NULL
     OR NOT EXISTS (
       SELECT 1
       FROM dbo.roles r
       WHERE r.role_code = g.role_code OR r.role_name = g.role_name
     )
)
BEGIN
  ROLLBACK TRANSACTION;
  THROW 51000, 'A required birth/death registrar role or permission was not found.', 1;
END;

DECLARE @resolved TABLE (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  role_code VARCHAR(50) NOT NULL,
  role_name VARCHAR(100) NOT NULL,
  permission_code VARCHAR(50) NOT NULL
);

INSERT INTO @resolved (role_id, permission_id, role_code, role_name, permission_code)
SELECT DISTINCT r.role_id, p.permission_id, g.role_code, g.role_name, g.permission_code
FROM @grants g
JOIN dbo.roles r ON r.role_code = g.role_code OR r.role_name = g.role_name
JOIN dbo.permissions p ON p.permission_code = g.permission_code;

IF EXISTS (
  SELECT role_code, permission_code
  FROM @resolved
  GROUP BY role_code, permission_code
  HAVING COUNT(*) > 1
)
BEGIN
  ROLLBACK TRANSACTION;
  THROW 51001, 'A registrar role name maps to multiple roles; no permissions were changed.', 1;
END;

UPDATE rp
SET is_deleted = 0,
    updated_at = SYSUTCDATETIME()
FROM dbo.role_permissions rp
JOIN @resolved g ON g.role_id = rp.role_id AND g.permission_id = rp.permission_id;

INSERT INTO dbo.role_permissions (role_id, permission_id, granted_at, created_at, is_deleted)
SELECT g.role_id, g.permission_id, SYSUTCDATETIME(), SYSUTCDATETIME(), 0
FROM @resolved g
WHERE NOT EXISTS (
  SELECT 1
  FROM dbo.role_permissions rp
  WHERE rp.role_id = g.role_id
    AND rp.permission_id = g.permission_id
);

SELECT r.role_code, r.role_name, p.permission_code
FROM @resolved g
JOIN dbo.roles r ON r.role_id = g.role_id
JOIN dbo.permissions p ON p.permission_id = g.permission_id
JOIN dbo.role_permissions rp
  ON rp.role_id = g.role_id
 AND rp.permission_id = g.permission_id
WHERE rp.is_deleted = 0
ORDER BY r.role_name, p.permission_code;

COMMIT TRANSACTION;

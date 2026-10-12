SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @grants TABLE (role_code VARCHAR(50), permission_code VARCHAR(50));
INSERT INTO @grants (role_code, permission_code)
VALUES
  ('VILLAGE_OFFICER', 'BIRTH_VIEW'),
  ('VILLAGE_OFFICER', 'BIRTH_CREATE');

IF EXISTS (
  SELECT 1
  FROM @grants g
  LEFT JOIN dbo.roles r ON r.role_code = g.role_code
  LEFT JOIN dbo.permissions p ON p.permission_code = g.permission_code
  WHERE r.role_id IS NULL OR p.permission_id IS NULL
)
BEGIN
  ROLLBACK TRANSACTION;
  THROW 51000, 'A required birth role or permission was not found.', 1;
END;

UPDATE rp
SET is_deleted = 0,
    updated_at = SYSUTCDATETIME()
FROM dbo.role_permissions rp
JOIN dbo.roles r ON r.role_id = rp.role_id
JOIN dbo.permissions p ON p.permission_id = rp.permission_id
JOIN @grants g ON g.role_code = r.role_code AND g.permission_code = p.permission_code;

INSERT INTO dbo.role_permissions (role_id, permission_id, granted_at, created_at, is_deleted)
SELECT r.role_id, p.permission_id, SYSUTCDATETIME(), SYSUTCDATETIME(), 0
FROM @grants g
JOIN dbo.roles r ON r.role_code = g.role_code
JOIN dbo.permissions p ON p.permission_code = g.permission_code
WHERE NOT EXISTS (
  SELECT 1
  FROM dbo.role_permissions rp
  WHERE rp.role_id = r.role_id
    AND rp.permission_id = p.permission_id
);

COMMIT TRANSACTION;

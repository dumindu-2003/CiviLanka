/*
  NIC application storage for the existing village-officer form.
  Additive only:
  - does not update, delete, or rewrite existing rows
  - does not rename columns
  - does not alter dbo.village_officer
  - reuses dbo.nic_application (applicant_id -> citizens.citizen_id)
  - adds only fields the form has that the table did not store
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

IF COL_LENGTH(N'dbo.nic_application', N'same_as_permanent') IS NULL
  ALTER TABLE dbo.nic_application ADD same_as_permanent BIT NULL;

IF COL_LENGTH(N'dbo.nic_application', N'nic_type') IS NULL
  ALTER TABLE dbo.nic_application ADD nic_type VARCHAR(20) NULL;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.check_constraints
  WHERE name = N'ck_nic_type' AND parent_object_id = OBJECT_ID(N'dbo.nic_application')
)
  ALTER TABLE dbo.nic_application ADD CONSTRAINT ck_nic_type
    CHECK (nic_type IS NULL OR nic_type IN ('New', 'Renewal'));

IF NOT EXISTS (
  SELECT 1 FROM sys.check_constraints
  WHERE name = N'ck_nic_religion' AND parent_object_id = OBJECT_ID(N'dbo.nic_application')
)
  ALTER TABLE dbo.nic_application ADD CONSTRAINT ck_nic_religion
    CHECK (religion IS NULL OR religion IN (
      N'Buddhist', N'Hindu', N'Islam', N'Roman Catholic', N'Christian', N'Other'
    ));

IF NOT EXISTS (
  SELECT 1 FROM sys.check_constraints
  WHERE name = N'ck_nic_district' AND parent_object_id = OBJECT_ID(N'dbo.nic_application')
)
  ALTER TABLE dbo.nic_application ADD CONSTRAINT ck_nic_district
    CHECK (district IS NULL OR district IN (
      N'Ampara', N'Anuradhapura', N'Badulla', N'Batticaloa', N'Colombo', N'Galle', N'Gampaha',
      N'Hambantota', N'Jaffna', N'Kalutara', N'Kandy', N'Kegalle', N'Kilinochchi', N'Kurunegala',
      N'Mannar', N'Matale', N'Matara', N'Monaragala', N'Mullaitivu', N'Nuwara Eliya', N'Polonnaruwa',
      N'Puttalam', N'Ratnapura', N'Trincomalee', N'Vavuniya'
    ));

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = N'ux_nic_application_app_ref' AND object_id = OBJECT_ID(N'dbo.nic_application')
)
AND NOT EXISTS (
  SELECT app_ref FROM dbo.nic_application
  GROUP BY app_ref
  HAVING COUNT(*) > 1
)
  CREATE UNIQUE INDEX ux_nic_application_app_ref
    ON dbo.nic_application (app_ref);
GO

IF OBJECT_ID(N'dbo.nic_application_document', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.nic_application_document (
    nic_document_id     INT IDENTITY(1,1) NOT NULL,
    nic_app_id          INT NOT NULL,
    document_key        VARCHAR(20) NOT NULL,
    original_file_name  NVARCHAR(260) NOT NULL,
    content_type        VARCHAR(100) NOT NULL,
    file_size_bytes     INT NOT NULL,
    stored_file_name    NVARCHAR(260) NOT NULL,
    created_by          INT NULL,
    created_at          DATETIME2 NOT NULL CONSTRAINT df_nic_document_created_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT pk_nic_application_document PRIMARY KEY (nic_document_id),
    CONSTRAINT fk_nic_document_application FOREIGN KEY (nic_app_id)
      REFERENCES dbo.nic_application (nic_app_id),
    CONSTRAINT fk_nic_document_created_by FOREIGN KEY (created_by)
      REFERENCES dbo.officers_login (officer_id),
    CONSTRAINT ux_nic_document_app_key UNIQUE (nic_app_id, document_key),
    CONSTRAINT ck_nic_document_key CHECK (document_key IN ('birth', 'address', 'photo', 'previous')),
    CONSTRAINT ck_nic_document_size CHECK (file_size_bytes BETWEEN 1 AND 5242880),
    CONSTRAINT ck_nic_document_type CHECK (
      (document_key = 'photo' AND content_type IN ('image/jpeg', 'image/png'))
      OR (document_key IN ('birth', 'address', 'previous') AND content_type IN ('application/pdf', 'image/jpeg'))
    )
  );
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_nic
  @action_type VARCHAR(40), @acting_officer_id INT, @app_id INT = NULL, @data NVARCHAR(MAX) = NULL,
  @status VARCHAR(20) = NULL, @signoff_officer_id INT = NULL
AS
BEGIN
  SET NOCOUNT ON; SET XACT_ABORT ON;

  IF @action_type IN ('2','3')
    BEGIN EXEC dbo.usp_authorize @acting_officer_id, 'NIC_VIEW'; END
  ELSE IF @action_type IN ('4','5','6','7')
    BEGIN EXEC dbo.usp_authorize @acting_officer_id, 'NIC_CREATE'; END
  ELSE
    THROW 50400, N'Unknown action_type for sp_nic.', 1;

  IF @action_type = '2'
  BEGIN
    SELECT nic_app_id AS app_id, app_ref, full_name AS name, status, rejection_reason, created_at
    FROM dbo.nic_application
    WHERE submitted_by = @acting_officer_id AND status <> 'Deleted' AND (@status IS NULL OR status = @status)
    ORDER BY created_at DESC;
    RETURN;
  END

  IF @action_type = '3'
  BEGIN
    SELECT n.*,
      (
        SELECT d.document_key, d.original_file_name, d.content_type, d.file_size_bytes, d.stored_file_name
        FROM dbo.nic_application_document d
        WHERE d.nic_app_id = n.nic_app_id
        FOR JSON PATH
      ) AS documents
    FROM dbo.nic_application n
    WHERE n.nic_app_id = @app_id AND n.status <> 'Deleted'
      AND (n.submitted_by = @acting_officer_id OR dbo.fn_has_permission(@acting_officer_id, 'APPLICATION_APPROVE') = 1);
    RETURN;
  END

  IF @action_type IN ('4','5')
  BEGIN
    IF ISJSON(@data) <> 1 THROW 50400, N'data must be valid JSON.', 1;
    SELECT * INTO #j FROM OPENJSON(@data) WITH (
      applicant_id INT '$.applicant_id', full_name NVARCHAR(100) '$.full_name', date_of_birth DATE '$.date_of_birth',
      gender VARCHAR(10) '$.gender', place_of_birth NVARCHAR(100) '$.place_of_birth', district NVARCHAR(50) '$.district',
      religion NVARCHAR(50) '$.religion', occupation NVARCHAR(100) '$.occupation',
      permanent_address NVARCHAR(200) '$.permanent_address', current_address NVARCHAR(200) '$.current_address',
      same_as_permanent BIT '$.same_as_permanent',
      phone VARCHAR(15) '$.phone', email VARCHAR(100) '$.email', father_name NVARCHAR(100) '$.father_name',
      father_nic VARCHAR(12) '$.father_nic', mother_name NVARCHAR(100) '$.mother_name', mother_nic VARCHAR(12) '$.mother_nic',
      marital_status VARCHAR(20) '$.marital_status', spouse_name NVARCHAR(100) '$.spouse_name',
      nic_type VARCHAR(20) '$.nic_type');

    IF EXISTS (SELECT 1 FROM #j WHERE nic_type IS NOT NULL AND nic_type NOT IN ('New', 'Renewal'))
      THROW 50400, N'nic_type must be New or Renewal.', 1;

    CREATE TABLE #docs (
      document_key VARCHAR(20) NULL,
      original_file_name NVARCHAR(260) NULL,
      content_type VARCHAR(100) NULL,
      file_size_bytes INT NULL,
      stored_file_name NVARCHAR(260) NULL);

    IF JSON_QUERY(@data, '$.documents') IS NOT NULL
    BEGIN
      INSERT INTO #docs (document_key, original_file_name, content_type, file_size_bytes, stored_file_name)
      SELECT document_key, original_file_name, content_type, file_size_bytes, stored_file_name
      FROM OPENJSON(@data, '$.documents') WITH (
        document_key VARCHAR(20) '$.document_key',
        original_file_name NVARCHAR(260) '$.original_file_name',
        content_type VARCHAR(100) '$.content_type',
        file_size_bytes INT '$.file_size_bytes',
        stored_file_name NVARCHAR(260) '$.stored_file_name');

      IF EXISTS (
        SELECT 1 FROM #docs
        WHERE document_key IS NULL
           OR document_key NOT IN ('birth', 'address', 'photo', 'previous')
           OR NULLIF(LTRIM(RTRIM(original_file_name)), N'') IS NULL
           OR NULLIF(LTRIM(RTRIM(stored_file_name)), N'') IS NULL
           OR file_size_bytes IS NULL OR file_size_bytes < 1 OR file_size_bytes > 5242880
           OR (document_key = 'photo' AND content_type NOT IN ('image/jpeg', 'image/png'))
           OR (document_key IN ('birth', 'address', 'previous') AND content_type NOT IN ('application/pdf', 'image/jpeg'))
      )
        THROW 50400, N'A document is missing a name, exceeds 5MB, or uses a file type the form does not allow.', 1;

      IF EXISTS (SELECT document_key FROM #docs GROUP BY document_key HAVING COUNT(*) > 1)
        THROW 50400, N'Each document can be attached only once.', 1;
    END

    DECLARE @saved_id INT;
    BEGIN TRAN;

    IF @action_type = '4'
    BEGIN
      SET @status = ISNULL(@status, 'Draft');
      IF @status NOT IN ('Draft','Pending') THROW 50400, N'status must be Draft or Pending.', 1;
      IF @status = 'Pending' EXEC dbo.usp_validate_signoff @signoff_officer_id;

      INSERT dbo.nic_application
        (applicant_id, full_name, date_of_birth, gender, place_of_birth, district, religion, occupation,
         permanent_address, current_address, same_as_permanent, phone, email, father_name, father_nic,
         mother_name, mother_nic, marital_status, spouse_name, nic_type, status, submitted_by, signed_off_by)
      SELECT applicant_id, full_name, date_of_birth, gender, place_of_birth, district, religion, occupation,
             permanent_address, current_address, same_as_permanent, phone, email, father_name, father_nic,
             mother_name, mother_nic, marital_status, spouse_name, nic_type,
             @status, @acting_officer_id, CASE WHEN @status = 'Pending' THEN @signoff_officer_id END
      FROM #j;
      SET @saved_id = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
      UPDATE n SET n.applicant_id = j.applicant_id, n.full_name = j.full_name, n.date_of_birth = j.date_of_birth, n.gender = j.gender,
        n.place_of_birth = j.place_of_birth, n.district = j.district, n.religion = j.religion, n.occupation = j.occupation,
        n.permanent_address = j.permanent_address, n.current_address = j.current_address, n.same_as_permanent = j.same_as_permanent,
        n.phone = j.phone, n.email = j.email, n.father_name = j.father_name, n.father_nic = j.father_nic,
        n.mother_name = j.mother_name, n.mother_nic = j.mother_nic, n.marital_status = j.marital_status, n.spouse_name = j.spouse_name,
        n.nic_type = j.nic_type, n.status = 'Draft', n.updated_at = SYSUTCDATETIME(), n.updated_by = @acting_officer_id
      FROM dbo.nic_application n CROSS JOIN #j j
      WHERE n.nic_app_id = @app_id AND n.submitted_by = @acting_officer_id AND n.status IN ('Draft','Rejected');
      IF @@ROWCOUNT = 0 THROW 50404, N'Record not found, or it can no longer be edited.', 1;
      SET @saved_id = @app_id;
    END

    IF JSON_QUERY(@data, '$.documents') IS NOT NULL
    BEGIN
      UPDATE d
      SET d.original_file_name = s.original_file_name,
          d.content_type = s.content_type,
          d.file_size_bytes = s.file_size_bytes,
          d.stored_file_name = s.stored_file_name
      FROM dbo.nic_application_document d
      INNER JOIN #docs s ON s.document_key = d.document_key
      WHERE d.nic_app_id = @saved_id;

      INSERT dbo.nic_application_document
        (nic_app_id, document_key, original_file_name, content_type, file_size_bytes, stored_file_name, created_by)
      SELECT @saved_id, s.document_key, s.original_file_name, s.content_type, s.file_size_bytes, s.stored_file_name, @acting_officer_id
      FROM #docs s
      WHERE NOT EXISTS (
        SELECT 1 FROM dbo.nic_application_document d
        WHERE d.nic_app_id = @saved_id AND d.document_key = s.document_key
      );
    END

    COMMIT TRAN;

    IF @action_type = '4'
      SELECT nic_app_id AS app_id, app_ref, status FROM dbo.nic_application WHERE nic_app_id = @saved_id;
    ELSE
      SELECT @app_id AS app_id, 'Draft' AS status;
    RETURN;
  END

  IF @action_type = '6'
  BEGIN
    EXEC dbo.usp_validate_signoff @signoff_officer_id;
    UPDATE dbo.nic_application
    SET status = 'Pending', signed_off_by = @signoff_officer_id, rejection_reason = NULL, updated_at = SYSUTCDATETIME(), updated_by = @acting_officer_id
    WHERE nic_app_id = @app_id AND submitted_by = @acting_officer_id AND status = 'Draft';
    IF @@ROWCOUNT = 0 THROW 50404, N'Draft not found.', 1;
    SELECT app_ref AS receipt_ref, 'Pending' AS status FROM dbo.nic_application WHERE nic_app_id = @app_id;
    RETURN;
  END

  IF @action_type = '7'
  BEGIN
    UPDATE dbo.nic_application SET status = 'Deleted', updated_by = @acting_officer_id, updated_at = SYSUTCDATETIME()
    WHERE nic_app_id = @app_id AND submitted_by = @acting_officer_id AND status = 'Draft';
    IF @@ROWCOUNT = 0 THROW 50404, N'Draft not found.', 1;
    SELECT @app_id AS app_id;
    RETURN;
  END
END
GO

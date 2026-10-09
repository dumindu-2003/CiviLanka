SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

ALTER TABLE dbo.birth_certificate_application
  ALTER COLUMN applicant_id INT NULL;
GO

ALTER TABLE dbo.death_certificate_application
  ALTER COLUMN applicant_id INT NULL;
GO

ALTER PROCEDURE dbo.usp_decide_application
  @app_ref VARCHAR(20),
  @decision VARCHAR(10),
  @acting_officer_id INT,
  @signoff_officer_id INT,
  @reason NVARCHAR(250) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF @decision NOT IN ('APPROVE', 'REJECT')
    THROW 50400, N'decision must be APPROVE or REJECT.', 1;
  IF @decision = 'REJECT' AND (@reason IS NULL OR LTRIM(RTRIM(@reason)) = N'')
    THROW 50400, N'A rejection reason is required.', 1;
  IF @signoff_officer_id IS NULL OR dbo.fn_has_permission(@signoff_officer_id, 'APPLICATION_APPROVE') = 0
    THROW 50401, N'A verified authorizing officer with approval rights is required.', 1;

  IF NOT EXISTS (
    SELECT 1
    FROM dbo.officers_login ol
    JOIN dbo.roles r ON r.role_id = ol.role_id
    WHERE ol.officer_id = @acting_officer_id
      AND r.role_code = 'DISTRICT_REGISTRAR'
  )
    THROW 50403, N'Only a District Registrar can approve or reject applications.', 1;

  DECLARE @district_registrar_id INT = (
    SELECT dr.district_registrar_id
    FROM dbo.district_registrar dr
    WHERE dr.officer_id = @acting_officer_id
  );
  IF @district_registrar_id IS NULL
    THROW 50403, N'The District Registrar profile is missing for this account.', 1;

  DECLARE @prefix CHAR(3) = LEFT(@app_ref, 3);
  DECLARE @id INT = TRY_CAST(SUBSTRING(@app_ref, 5, 10) AS INT);
  DECLARE @tbl SYSNAME = CASE @prefix
    WHEN 'BRT' THEN N'birth_certificate_application'
    WHEN 'DTH' THEN N'death_certificate_application'
    WHEN 'MRG' THEN N'marriage_certificate_application'
    WHEN 'NIC' THEN N'nic_application'
  END;
  DECLARE @pk SYSNAME = CASE @prefix
    WHEN 'BRT' THEN N'birth_app_id'
    WHEN 'DTH' THEN N'death_app_id'
    WHEN 'MRG' THEN N'marriage_app_id'
    WHEN 'NIC' THEN N'nic_app_id'
  END;
  IF @tbl IS NULL OR @id IS NULL
    THROW 50404, N'Invalid application reference.', 1;

  DECLARE @status VARCHAR(20) = CASE @decision WHEN 'APPROVE' THEN 'Approved' ELSE 'Rejected' END;
  DECLARE @rows INT = 0;
  DECLARE @sql NVARCHAR(MAX) =
      N'UPDATE dbo.' + QUOTENAME(@tbl)
    + N' SET status = @status, approved_by = @district_registrar_id, approved_at = SYSUTCDATETIME(), '
    + N'updated_by = @acting_officer_id, rejection_reason = @reason, updated_at = SYSUTCDATETIME() '
    + N'WHERE ' + QUOTENAME(@pk) + N' = @id AND status = ''Pending''; SET @rows = @@ROWCOUNT;';

  EXEC sys.sp_set_session_context @key = N'signoff_officer_id', @value = @signoff_officer_id;
  EXEC sys.sp_executesql @sql,
    N'@status VARCHAR(20), @district_registrar_id INT, @acting_officer_id INT, @reason NVARCHAR(250), @id INT, @rows INT OUTPUT',
    @status = @status,
    @district_registrar_id = @district_registrar_id,
    @acting_officer_id = @acting_officer_id,
    @reason = @reason,
    @id = @id,
    @rows = @rows OUTPUT;
  EXEC sys.sp_set_session_context @key = N'signoff_officer_id', @value = NULL;

  IF @rows = 0
    THROW 50409, N'Application not found or it is not in Pending status.', 1;
END
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* The death registration form does not select a citizen record. */
ALTER TABLE dbo.death_certificate_application
  ALTER COLUMN applicant_id INT NULL;
GO

/* Village Officer may lodge a death report. The Death Registrar sees it and approves it.
   The owner can edit a Draft, Pending, or Rejected report. An Approved report is locked. */
INSERT dbo.role_permissions (role_id, permission_id, granted_at, created_at, is_deleted)
SELECT r.role_id, p.permission_id, SYSUTCDATETIME(), SYSUTCDATETIME(), 0
FROM dbo.roles r
CROSS JOIN dbo.permissions p
WHERE r.role_code = N'VILLAGE_OFFICER'
  AND p.permission_code IN (N'DEATH_CREATE', N'DEATH_VIEW')
  AND NOT EXISTS (
    SELECT 1
    FROM dbo.role_permissions rp
    WHERE rp.role_id = r.role_id
      AND rp.permission_id = p.permission_id
      AND rp.is_deleted = 0
  );
GO

CREATE OR ALTER PROCEDURE dbo.sp_death
  @action_type VARCHAR(40), @acting_officer_id INT, @app_id INT = NULL, @data NVARCHAR(MAX) = NULL,
  @status VARCHAR(20) = NULL, @signoff_officer_id INT = NULL
AS
BEGIN
  SET NOCOUNT ON; SET XACT_ABORT ON;

  /* 1=DASHBOARD  2=LIST  3=GET  4=CREATE  5=UPDATE  6=SUBMIT  7=DELETE  8=DECIDE */
  IF @action_type IN ('1','2','3')
    BEGIN EXEC dbo.usp_authorize @acting_officer_id, 'DEATH_VIEW'; END
  ELSE IF @action_type IN ('4','5','6','7','8')
    BEGIN EXEC dbo.usp_authorize @acting_officer_id, 'DEATH_CREATE'; END
  ELSE
    THROW 50400, N'Unknown action_type for sp_death.', 1;

  DECLARE @is_registrar BIT = CASE WHEN EXISTS (
    SELECT 1
    FROM dbo.officers_login ol
    JOIN dbo.roles r ON r.role_id = ol.role_id
    WHERE ol.officer_id = @acting_officer_id AND r.role_code = N'DEATH_REGISTRAR'
  ) THEN 1 ELSE 0 END;

  IF @action_type = '1'
  BEGIN
    SELECT ISNULL(SUM(CASE WHEN status = 'Draft'    THEN 1 ELSE 0 END), 0) AS new_entries,
           ISNULL(SUM(CASE WHEN status = 'Pending'  THEN 1 ELSE 0 END), 0) AS pending,
           ISNULL(SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END), 0) AS approved
    FROM dbo.death_certificate_application
    WHERE status <> 'Deleted'
      AND (
        submitted_by = @acting_officer_id
        OR (@is_registrar = 1 AND status IN ('Pending','Approved','Rejected'))
      );

    SELECT TOP (5) death_app_id AS app_id, app_ref, deceased_name AS name, status, created_at
    FROM dbo.death_certificate_application
    WHERE status <> 'Deleted'
      AND (
        submitted_by = @acting_officer_id
        OR (@is_registrar = 1 AND status IN ('Pending','Approved','Rejected'))
      )
    ORDER BY created_at DESC;
    RETURN;
  END

  IF @action_type = '2'
  BEGIN
    SELECT death_app_id AS app_id, app_ref, deceased_name AS name, date_of_death, status, rejection_reason, created_at, submitted_by
    FROM dbo.death_certificate_application
    WHERE status <> 'Deleted' AND (@status IS NULL OR status = @status)
      AND (
        submitted_by = @acting_officer_id
        OR (@is_registrar = 1 AND submitted_by <> @acting_officer_id AND status IN ('Pending','Approved','Rejected'))
      )
    ORDER BY created_at DESC;
    RETURN;
  END

  IF @action_type = '3'
  BEGIN
    SELECT * FROM dbo.death_certificate_application
    WHERE death_app_id = @app_id AND status <> 'Deleted'
      AND (
        submitted_by = @acting_officer_id
        OR dbo.fn_has_permission(@acting_officer_id, 'APPLICATION_APPROVE') = 1
        OR @is_registrar = 1
      );
    RETURN;
  END

  IF @action_type IN ('4','5')
  BEGIN
    IF ISJSON(@data) <> 1 THROW 50400, N'data must be valid JSON.', 1;
    SELECT * INTO #j FROM OPENJSON(@data) WITH (
      applicant_id INT '$.applicant_id', deceased_name NVARCHAR(100) '$.deceased_name', deceased_nic VARCHAR(12) '$.deceased_nic',
      date_of_birth DATE '$.date_of_birth', date_of_death DATE '$.date_of_death', time_of_death TIME(0) '$.time_of_death',
      place_of_death NVARCHAR(150) '$.place_of_death', gender VARCHAR(10) '$.gender', age_at_death INT '$.age_at_death',
      cause_of_death NVARCHAR(200) '$.cause_of_death', marital_status VARCHAR(20) '$.marital_status',
      permanent_address NVARCHAR(200) '$.permanent_address', informant_name NVARCHAR(100) '$.informant_name',
      informant_nic VARCHAR(12) '$.informant_nic', informant_relationship NVARCHAR(50) '$.informant_relationship',
      informant_contact VARCHAR(15) '$.informant_contact');

    IF @action_type = '4'
    BEGIN
      SET @status = ISNULL(@status, 'Draft');
      IF @status NOT IN ('Draft','Pending') THROW 50400, N'status must be Draft or Pending.', 1;
      IF @status = 'Pending' EXEC dbo.usp_validate_signoff @signoff_officer_id;

      INSERT dbo.death_certificate_application
        (applicant_id, deceased_name, deceased_nic, date_of_birth, date_of_death, time_of_death, place_of_death, gender, age_at_death,
         cause_of_death, marital_status, permanent_address, informant_name, informant_nic, informant_relationship, informant_contact,
         status, submitted_by, signed_off_by)
      SELECT applicant_id, deceased_name, deceased_nic, date_of_birth, date_of_death, time_of_death, place_of_death, gender, age_at_death,
             cause_of_death, marital_status, permanent_address, informant_name, informant_nic, informant_relationship, informant_contact,
             @status, @acting_officer_id, CASE WHEN @status = 'Pending' THEN @signoff_officer_id END
      FROM #j;
      DECLARE @new_id INT = SCOPE_IDENTITY();
      SELECT death_app_id AS app_id, app_ref, status FROM dbo.death_certificate_application WHERE death_app_id = @new_id;
    END
    ELSE
    BEGIN
      DECLARE @current VARCHAR(20);
      SELECT @current = status
      FROM dbo.death_certificate_application
      WHERE death_app_id = @app_id AND submitted_by = @acting_officer_id AND status <> 'Deleted';

      IF @current IS NULL
        THROW 50404, N'Record not found, or it can no longer be edited.', 1;
      IF @current = 'Approved'
        THROW 50409, N'This death report is approved and can no longer be edited.', 1;
      IF @current NOT IN ('Draft','Pending','Rejected')
        THROW 50404, N'Record not found, or it can no longer be edited.', 1;

      DECLARE @next VARCHAR(20) = CASE WHEN @current = 'Rejected' THEN 'Pending' ELSE @current END;

      UPDATE d SET d.applicant_id = j.applicant_id, d.deceased_name = j.deceased_name, d.deceased_nic = j.deceased_nic,
        d.date_of_birth = j.date_of_birth, d.date_of_death = j.date_of_death, d.time_of_death = j.time_of_death,
        d.place_of_death = j.place_of_death, d.gender = j.gender, d.age_at_death = j.age_at_death, d.cause_of_death = j.cause_of_death,
        d.marital_status = j.marital_status, d.permanent_address = j.permanent_address, d.informant_name = j.informant_name,
        d.informant_nic = j.informant_nic, d.informant_relationship = j.informant_relationship, d.informant_contact = j.informant_contact,
        d.status = @next,
        d.rejection_reason = CASE WHEN @current = 'Rejected' THEN NULL ELSE d.rejection_reason END,
        d.updated_at = SYSUTCDATETIME(), d.updated_by = @acting_officer_id
      FROM dbo.death_certificate_application d CROSS JOIN #j j
      WHERE d.death_app_id = @app_id AND d.submitted_by = @acting_officer_id AND d.status = @current;
      IF @@ROWCOUNT = 0 THROW 50404, N'Record not found, or it can no longer be edited.', 1;
      SELECT @app_id AS app_id, @next AS status;
    END
    RETURN;
  END

  IF @action_type = '6'
  BEGIN
    EXEC dbo.usp_validate_signoff @signoff_officer_id;
    UPDATE dbo.death_certificate_application
    SET status = 'Pending', signed_off_by = @signoff_officer_id, rejection_reason = NULL, updated_at = SYSUTCDATETIME(), updated_by = @acting_officer_id
    WHERE death_app_id = @app_id AND submitted_by = @acting_officer_id AND status = 'Draft';
    IF @@ROWCOUNT = 0 THROW 50404, N'Draft not found.', 1;
    SELECT @app_id AS app_id, 'Pending' AS status;
    RETURN;
  END

  IF @action_type = '7'
  BEGIN
    UPDATE dbo.death_certificate_application SET status = 'Deleted', updated_by = @acting_officer_id, updated_at = SYSUTCDATETIME()
    WHERE death_app_id = @app_id AND submitted_by = @acting_officer_id AND status = 'Draft';
    IF @@ROWCOUNT = 0 THROW 50404, N'Draft not found.', 1;
    SELECT @app_id AS app_id;
    RETURN;
  END

  IF @action_type = '8'
  BEGIN
    IF @is_registrar = 0
      THROW 50403, N'Only a Death Registrar can approve or reject a death report.', 1;
    IF @status NOT IN ('Approved','Rejected')
      THROW 50400, N'decision must be Approved or Rejected.', 1;

    DECLARE @reason NVARCHAR(250) = NULL;
    IF ISJSON(@data) = 1
      SELECT @reason = reason FROM OPENJSON(@data) WITH (reason NVARCHAR(250) '$.reason');
    IF @status = 'Rejected' AND (@reason IS NULL OR LTRIM(RTRIM(@reason)) = N'')
      THROW 50400, N'A rejection reason is required.', 1;

    UPDATE dbo.death_certificate_application
    SET status = @status,
        rejection_reason = CASE WHEN @status = 'Rejected' THEN @reason ELSE NULL END,
        approved_at = CASE WHEN @status = 'Approved' THEN SYSUTCDATETIME() ELSE approved_at END,
        updated_at = SYSUTCDATETIME(),
        updated_by = @acting_officer_id
    WHERE death_app_id = @app_id AND status = 'Pending';
    IF @@ROWCOUNT = 0 THROW 50409, N'Application not found or it is not waiting for approval.', 1;
    SELECT @app_id AS app_id, @status AS status;
    RETURN;
  END
END
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

/* Village officer certificate preview.
   Action 1 stays the dashboard. Action 2 returns one category for the preview screen.
   Authorized with CITIZEN_SEARCH, the permission the village officer already has. */
CREATE OR ALTER PROCEDURE dbo.sp_village
  @action_type VARCHAR(40),
  @acting_officer_id INT,
  @category VARCHAR(10) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  EXEC dbo.usp_authorize @acting_officer_id, 'CITIZEN_SEARCH';

  IF @action_type = '1'
  BEGIN
    SELECT TOP (10) app_ref, category, subject_name AS name, status, created_at
    FROM dbo.vw_all_applications
    WHERE status <> 'Draft' AND category <> 'NIC'
    ORDER BY created_at DESC;

    SELECT COUNT(*) AS my_pending_nic
    FROM dbo.nic_application
    WHERE submitted_by = @acting_officer_id AND status = 'Pending';
    RETURN;
  END

  IF @action_type = '2'
  BEGIN
    IF @category NOT IN (N'Birth', N'Death', N'Marriage')
      THROW 50400, N'Category must be Birth, Death, or Marriage.', 1;

    IF @category = N'Birth'
    BEGIN
      SELECT TOP (50)
        app_ref,
        status,
        baby_full_name AS subject_name,
        CONVERT(varchar(10), date_of_birth, 23) AS date_of_birth,
        CONVERT(varchar(8), time_of_birth, 108) AS time_of_birth,
        place_of_birth,
        gender,
        CONVERT(varchar(20), birth_weight) AS birth_weight,
        father_name,
        mother_name,
        hospital_name,
        CONVERT(varchar(10), registration_date, 23) AS registration_date
      FROM dbo.birth_certificate_application
      WHERE status NOT IN (N'Draft', N'Deleted')
      ORDER BY created_at DESC;
      RETURN;
    END

    IF @category = N'Death'
    BEGIN
      SELECT TOP (50)
        app_ref,
        status,
        deceased_name AS subject_name,
        deceased_nic,
        CONVERT(varchar(10), date_of_death, 23) AS date_of_death,
        CONVERT(varchar(8), time_of_death, 108) AS time_of_death,
        place_of_death,
        gender,
        CONVERT(varchar(10), age_at_death) AS age_at_death,
        cause_of_death,
        permanent_address
      FROM dbo.death_certificate_application
      WHERE status NOT IN (N'Draft', N'Deleted')
      ORDER BY created_at DESC;
      RETURN;
    END

    SELECT TOP (50)
      app_ref,
      status,
      CONCAT(groom_name, N' & ', bride_name) AS subject_name,
      groom_name,
      bride_name,
      CONVERT(varchar(10), marriage_date, 23) AS marriage_date,
      marriage_place,
      marriage_registrar,
      registration_number
    FROM dbo.marriage_certificate_application
    WHERE status NOT IN (N'Draft', N'Deleted')
    ORDER BY created_at DESC;
    RETURN;
  END;

  THROW 50400, N'Unknown action_type for sp_village.', 1;
END
GO

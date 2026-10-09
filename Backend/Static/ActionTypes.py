"""
Stored-procedure ActionType numbers.

Every stored procedure is called with ONE number in @ActionType / @action_type
(the data access layer sends it as a string: requestAPI.ActionType = "1").
The numbers below are the contract between this API and the SQL stored procedures
- see ACTION_TYPES.md for the full table.
"""


class AuthAction:            # sp_auth
    LOGIN = 1
    ACCESS = 2
    LOGIN_SUCCESS = 3
    CHANGE_PASSWORD = 4


class AdminAction:           # sp_admin
    ROLE_LIST = 1
    ROLE_CREATE = 2
    ROLE_UPDATE = 3
    ROLE_SET_ACTIVE = 4
    ROLE_DELETE = 5
    SCREEN_LIST = 6
    ROLE_SCREEN_LIST = 7
    ROLE_SCREEN_SET = 8
    PERMISSION_LIST = 9
    ROLE_PERMISSION_LIST = 10
    ROLE_PERMISSION_SET = 11
    OFFICER_LIST = 12
    OFFICER_CREATE = 13
    OFFICER_SET_ROLE = 14
    OFFICER_SET_ACTIVE = 15
    OFFICER_RESET_PASSWORD = 16
    DASHBOARD = 17


class NewsAction:            # sp_news
    LIST = 1
    GET = 2
    CREATE = 3
    UPDATE = 4
    PUBLISH = 5
    UNPUBLISH = 6
    DELETE = 7


class NotificationAction:    # sp_notification
    LIST = 1
    UNREAD_COUNT = 2
    MARK_READ = 3
    MARK_ALL_READ = 4
    DELETE = 5


class AuditAction:           # sp_audit
    LIST = 1


class ProfileAction:         # sp_profile
    GET = 1
    UPDATE_CONTACT = 2
    PHOTO_UPLOAD = 3
    PHOTO_GET = 4
    PHOTO_DELETE = 5


class CitizenAction:         # sp_citizen
    SEARCH = 1
    GET = 2
    CREATE = 3
    UPDATE = 4


class DistrictAction:        # sp_district
    SUMMARY = 1
    LIST = 2
    GET = 3
    NIC_PENDING_LIST = 4
    APPROVE = 5
    REJECT = 6
    REPORT_GENERATE = 7
    REPORT_LIST = 8
    REPORT_TREND = 9
    OFFICER_CREATE = 10      # Add Profile (District Registrar enrolls an officer)
    FIND_PERSON = 11         # Find People (NIC or service number)


class ApplicationAction:     # sp_birth, sp_death, sp_marriage, sp_nic (NIC has no DASHBOARD)
    DASHBOARD = 1
    LIST = 2
    GET = 3
    CREATE = 4
    UPDATE = 5
    SUBMIT = 6
    DELETE = 7


class VillageAction:         # sp_village
    DASHBOARD = 1
    PREVIEW = 2


class BankAction:            # sp_bank
    VERIFY = 1
    RECENT = 2
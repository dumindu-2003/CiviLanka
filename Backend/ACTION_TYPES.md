# Stored-procedure ActionType numbers

The API sends the action type as a **number** (as a string, e.g. `"4"`) in `@ActionType` / `@action_type`.
This table is the contract for the SQL stored procedures (numbers follow the order of the actions in `civil_registration_db_full.sql`).
The same numbers live in code in `Static/ActionTypes.py` - change them in one place only.

## What the SQL side must do (you said you will build it - nothing is generated here)

- Every procedure must compare `@action_type` with these numbers, e.g. `IF @action_type = '4'` (VARCHAR parameter, so quote it) instead of `'CREATE'`.
- `sp_auth` already accepts `'1'` for LOGIN; ACCESS / LOGIN_SUCCESS / CHANGE_PASSWORD must become `'2'` / `'3'` / `'4'`.
- `sp_district` APPROVE/REJECT: the script passes `@action_type` as `@decision` to `usp_decide_application` (`IN ('APPROVE','REJECT')`). With numbers, map `'5'` -> `'APPROVE'` and `'6'` -> `'REJECT'` before that call (the error text / audit text can keep the words).
- `sp_birth`, `sp_death`, `sp_marriage`, `sp_nic` use ONE numbering (`ApplicationAction`). NIC has no DASHBOARD, so `1` is simply unused there.
- `sp_audit` and `sp_village` only have one action; the API still sends `1`, so their `IF @action_type <> 'LIST'` / `<> 'DASHBOARD'` checks become `<> '1'`.
- Parameter names are unchanged from the script: `sp_auth` -> `@ActionType`, all other procedures -> `@action_type`.

## sp_auth  (/api/auth)  - `@ActionType`

| No | Action | API endpoint |
|---:|---|---|
| 1 | LOGIN | POST /api/auth/Login |
| 2 | ACCESS | (inside Login) + GET /api/auth/Access |
| 3 | LOGIN_SUCCESS | (inside Login) |
| 4 | CHANGE_PASSWORD | POST /api/auth/ChangePassword |

## sp_admin  (/api/admin)  - `@action_type`

| No | Action | API endpoint |
|---:|---|---|
| 1 | ROLE_LIST | GET /api/admin/RoleList |
| 2 | ROLE_CREATE | POST RoleCreate |
| 3 | ROLE_UPDATE | POST RoleUpdate |
| 4 | ROLE_SET_ACTIVE | POST RoleSetActive |
| 5 | ROLE_DELETE | POST RoleDelete |
| 6 | SCREEN_LIST | GET ScreenList |
| 7 | ROLE_SCREEN_LIST | GET RoleScreenList |
| 8 | ROLE_SCREEN_SET | POST RoleScreenSet |
| 9 | PERMISSION_LIST | GET PermissionList |
| 10 | ROLE_PERMISSION_LIST | GET RolePermissionList |
| 11 | ROLE_PERMISSION_SET | POST RolePermissionSet |
| 12 | OFFICER_LIST | GET OfficerList |
| 13 | OFFICER_CREATE | POST OfficerCreate |
| 14 | OFFICER_SET_ROLE | POST OfficerSetRole |
| 15 | OFFICER_SET_ACTIVE | POST OfficerSetActive |
| 16 | OFFICER_RESET_PASSWORD | POST OfficerResetPassword |
| 17 | DASHBOARD | GET Dashboard |

## sp_news  (/api/news)  - `@action_type`

| No | Action | API endpoint |
|---:|---|---|
| 1 | LIST | GET /api/news/List |
| 2 | GET | GET Get |
| 3 | CREATE | POST Create |
| 4 | UPDATE | POST Update |
| 5 | PUBLISH | POST Publish |
| 6 | UNPUBLISH | POST Unpublish |
| 7 | DELETE | POST Delete |

## sp_notification  (/api/notification)  - `@action_type`

| No | Action | API endpoint |
|---:|---|---|
| 1 | LIST | GET /api/notification/List |
| 2 | UNREAD_COUNT | GET UnreadCount |
| 3 | MARK_READ | POST MarkRead |
| 4 | MARK_ALL_READ | POST MarkAllRead |
| 5 | DELETE | POST Delete |

## sp_audit  (/api/audit)  - `@action_type`

| No | Action | API endpoint |
|---:|---|---|
| 1 | LIST | GET /api/audit/List |

## sp_profile  (/api/profile)  - `@action_type`

| No | Action | API endpoint |
|---:|---|---|
| 1 | GET | GET /api/profile/Get |
| 2 | UPDATE_CONTACT | POST UpdateContact |

## sp_citizen  (/api/citizen)  - `@action_type`

| No | Action | API endpoint |
|---:|---|---|
| 1 | SEARCH | GET /api/citizen/Search |
| 2 | GET | GET Get |
| 3 | CREATE | POST Create |
| 4 | UPDATE | POST Update |

## sp_district  (/api/district)  - `@action_type`

| No | Action | API endpoint |
|---:|---|---|
| 1 | SUMMARY | GET /api/district/Summary |
| 2 | LIST | GET List |
| 3 | GET | GET Get |
| 4 | NIC_PENDING_LIST | GET NicPendingList |
| 5 | APPROVE | POST Approve |
| 6 | REJECT | POST Reject |
| 7 | REPORT_GENERATE | POST ReportGenerate |
| 8 | REPORT_LIST | GET ReportList |
| 9 | REPORT_TREND | GET ReportTrend |

## sp_birth, sp_death, sp_marriage, sp_nic  (/api/birth | death | marriage | nic)  - `@action_type`

| No | Action | API endpoint |
|---:|---|---|
| 1 | DASHBOARD | GET Dashboard (not NIC) |
| 2 | LIST | GET List |
| 3 | GET | GET Get |
| 4 | CREATE | POST Create |
| 5 | UPDATE | POST Update |
| 6 | SUBMIT | POST Submit |
| 7 | DELETE | POST Delete |

## sp_village  (/api/village)  - `@action_type`

| No | Action | API endpoint |
|---:|---|---|
| 1 | DASHBOARD | GET /api/village/Dashboard |

## sp_bank  (/api/bank)  - `@action_type`

| No | Action | API endpoint |
|---:|---|---|
| 1 | VERIFY | GET /api/bank/Verify |
| 2 | RECENT | GET Recent |

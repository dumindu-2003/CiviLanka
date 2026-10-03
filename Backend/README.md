# GovernReg API  (ASP.NET MVC template -> Python FastAPI)

Same layered structure as the MVC template (`WebApplication1`):

| MVC template                       | FastAPI                                             |
|------------------------------------|-----------------------------------------------------|
| `Global.asax.cs`                   | `main.py`                                           |
| `App_Start/RouteConfig.cs`         | `App_Start/RouteConfig.py` (registers all routers)  |
| `App_Start/UnityConfig.cs`         | `App_Start/UnityConfig.py` (interface -> DA class)  |
| `App_Start/FilterConfig.cs`        | `App_Start/FilterConfig.py` (global error handling) |
| `Web.config`                       | `AppSettings.py` + `.env`                           |
| `Controllers/*Controller.cs`       | `Controllers/*Controller.py`                        |
| `Interfaces/I*.cs`                 | `Interfaces/I*.py`                                  |
| `DataAccess/DA*.cs`                | `DataAccess/DA*.py`                                 |
| `DataBaseConnectivity/DBConnect.cs`| `DataBaseConnectivity/DBConnect.py` (pyodbc)        |
| `Models/*`, `Models/RequestApiModels/*` | same folders                                   |
| `Static/LogHandler.cs`             | `Static/LogHandler.py` -> `Exceptionlogs/ExceptionLogs.txt` |

Flow of every call (unchanged): Controller -> Interface -> DataAccess (sets `ActionType` number) ->
`DBconnect.ProcedureRead(request, "sp_xxx")` -> `Response { StatusCode, Result, ResultSet }`.

## Run
```
pip install -r requirements.txt          # + "ODBC Driver 17 for SQL Server" installed on the machine
copy .env.example .env                   # edit DB_SERVER / DB_USER / DB_PASSWORD / JWT_SECRET
uvicorn main:app --reload                # Swagger UI: http://127.0.0.1:8000/docs
```

## Notes
- **Action types are numbers** - see `ACTION_TYPES.md` / `Static/ActionTypes.py`. The SQL procedures must be changed to compare these numbers (no SQL is generated here).
- Login: `POST /api/auth/Login` {username, service_number, password} -> BCrypt check in Python -> JWT. Send `Authorization: Bearer <token>` afterwards.
- `acting_officer_id` is always taken from the token. Sign-off (authorizing) officer: send `signoff_username`, `signoff_service_number`, `signoff_password`; the API verifies with BCrypt and passes only `signoff_officer_id` to SQL.
- Request properties that are `None` are not sent, so the SQL defaults (`@filter = 'All'`, `@publish = 0` ...) still apply.
- SQL `THROW` numbers are mapped to `StatusCode` (50400->400, 50401->401, 50403->403, 50404->404, 50409->409).
- Rows are returned as dictionaries keyed by the SQL column names (same as the SQL comments / React Native types).

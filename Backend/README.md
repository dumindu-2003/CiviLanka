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
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

For a phone to reach the API, keep the backend running on the PC, connect the phone
and PC to the same Wi-Fi, and set `EXPO_PUBLIC_API_URL` in `Frontend/.env` to
`http://<PC-LAN-IP>:8000` (find the PC's Wi-Fi IPv4 address with `ipconfig`).
Restart Expo after changing the URL. Open `http://<PC-LAN-IP>:8000/docs` on the
phone to verify connectivity; if it cannot connect, allow inbound TCP port 8000
through Windows Firewall. `0.0.0.0` is the backend bind address, not the address
to put in the app.

## Notes
- **Action types are numbers** - see `ACTION_TYPES.md` / `Static/ActionTypes.py`. The SQL procedures must be changed to compare these numbers (no SQL is generated here).
- Login: `POST /api/auth/Login` {username, service_number, password} -> BCrypt check in Python -> JWT. Send `Authorization: Bearer <token>` afterwards.
- `acting_officer_id` is always taken from the token. Sign-off (authorizing) officer: send `signoff_username`, `signoff_service_number`, `signoff_password`; the API verifies with BCrypt and passes only `signoff_officer_id` to SQL.
- Request properties that are `None` are not sent, so the SQL defaults (`@filter = 'All'`, `@publish = 0` ...) still apply.
- SQL `THROW` numbers are mapped to `StatusCode` (50400->400, 50401->401, 50403->403, 50404->404, 50409->409).
- Rows are returned as dictionaries keyed by the SQL column names (same as the SQL comments / React Native types).

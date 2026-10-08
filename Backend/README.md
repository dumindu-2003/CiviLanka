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

For a phone to reach the API over Wi-Fi, keep the backend running on the PC,
connect the phone and PC to the same local network, and set
`EXPO_PUBLIC_API_URL` in `Frontend/.env` to `http://<PC-LAN-IP>:8000` (find the
PC's Wi-Fi IPv4 address with `ipconfig`). Restart Expo after changing the URL.
Open `http://<PC-LAN-IP>:8000/docs` on the phone to verify connectivity; if it
cannot connect, allow inbound TCP port 8000 through Windows Firewall.

### Android phone using USB tethering

USB tethering shares the phone's internet connection with the PC; it does not
make the PC's LAN address reachable from the phone. For Android development,
forward both the Expo dev server and API ports over USB debugging:

1. Enable USB debugging on the phone and connect it to the PC with a USB cable.
2. In PowerShell, run `adb devices` and accept the debugging prompt on the phone.
   Confirm the phone appears with status `device`, then run:

   ```powershell
   adb reverse tcp:8081 tcp:8081
   adb reverse tcp:8000 tcp:8000
   ```

   If PowerShell says `adb` is not recognized, run these commands using the
   Android SDK Platform-Tools path (adjust it if your SDK is installed elsewhere):

   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:8000 tcp:8000
   ```

3. Start the backend on the PC using the command above.
4. Set `EXPO_PUBLIC_API_URL=http://127.0.0.1:8000` in `Frontend/.env`.
5. In `Frontend`, run `npm run start:usb`. This starts Expo in localhost mode,
   matching the USB reverse route for Metro on port 8081. Open the project in
   Expo Go on the connected phone.

The `adb` command comes with Android SDK Platform-Tools. Keep USB debugging
connected while using the app. After reconnecting the phone, repeat both
`adb reverse` commands if forwarding was lost. If Expo selects a port other than
8081, reverse that port instead. `0.0.0.0` is the backend bind address, not the
address to put in the app.

## Notes
- **Action types are numbers** - see `ACTION_TYPES.md` / `Static/ActionTypes.py`. The SQL procedures must be changed to compare these numbers (no SQL is generated here).
- Login: `POST /api/auth/Login` {username, service_number, password} -> BCrypt check in Python -> JWT. Send `Authorization: Bearer <token>` afterwards.
- `acting_officer_id` is always taken from the token. Sign-off (authorizing) officer: send `signoff_username`, `signoff_service_number`, `signoff_password`; the API verifies with BCrypt and passes only `signoff_officer_id` to SQL.
- Request properties that are `None` are not sent, so the SQL defaults (`@filter = 'All'`, `@publish = 0` ...) still apply.
- SQL `THROW` numbers are mapped to `StatusCode` (50400->400, 50401->401, 50403->403, 50404->404, 50409->409).
- Rows are returned as dictionaries keyed by the SQL column names (same as the SQL comments / React Native types).

## Birth and death applications

The authenticated `/api/birth` and `/api/death` CRUD routes use `sp_birth` and
`sp_death` through the shared application data-access layer. `Create` takes
`{ "status": "Draft" | "Pending", "data": { ... } }`; `Update` takes
`{ "app_id": <generated primary key>, "data": { ... } }`; `Submit` takes the
application ID and sign-off credentials. The database generates
`birth_app_id` / `death_app_id` (and `app_ref`) and owns status/audit columns.
Do not send those generated or audit values from the client.

The backend rejects data keys that are not application columns. Birth data
accepts `baby_full_name`, `date_of_birth`, `time_of_birth`, `place_of_birth`,
`gender`, `birth_weight`, `father_name`, `father_nic`, `father_occupation`,
`father_address`, `mother_name`, `mother_nic`, `mother_occupation`,
`mother_address`, `hospital_name`, and `registration_date`. Death data accepts
`deceased_name`, `deceased_nic`, `date_of_birth`, `date_of_death`,
`time_of_death`, `place_of_death`, `gender`, `age_at_death`, `cause_of_death`,
`marital_status`, `permanent_address`, `informant_name`, `informant_nic`,
`informant_relationship`, and `informant_contact`.

The SQL stored-procedure definitions are deployment dependencies and are not
included in this repository. They must map those keys to the corresponding
table columns, generate the primary key/reference, populate server-managed
columns, and enforce the project's ownership/authorization rules.

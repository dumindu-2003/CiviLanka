from typing import Any, Dict, Optional

from DataAccess.DABase import DABase
from DataBaseConnectivity.DBConnect import DBconnect
from Interfaces.IAuth import IAuth
from Models.RequestApiModels.UserRequestAPI import ChangePasswordRequestAPI, LoginRequestAPI, UserRequestAPI
from Models.Response import Response
from Static.ActionTypes import AuthAction
from Static.CredentialHandler import VerifyCredentials
from Static.LogHandler import LogHandler
from Static.Security import CreateToken, CurrentOfficer, HashPassword, ValidateNewPassword


class DAAuth(DABase, IAuth):
    ProcedureName = "sp_auth"
    ActionParam = "ActionType"       # sp_auth uses @ActionType (not @action_type)
    HasOutput = True                 # sp_auth has @ResultStatusCode / @Result / @ExceptionMessage

    # ---- helper: ACCESS (3 result sets: home screen, allowed screens, permission codes) ----
    def _LoadAccess(self, officerId: int, methodName: str):
        request = UserRequestAPI(p_officer_id=officerId)
        request.ActionType = str(AuthAction.ACCESS)
        with DBconnect() as dbConnect:
            res = dbConnect.ProcedureRead(request, self.ProcedureName, self.ActionParam, self.HasOutput)
        if res.ResultStatusCode != "1":
            LogHandler.WriteToLog(res.ExceptionMessage or res.Result, methodName)
            return None, self._Fail(res.ErrorCode, res.ExceptionMessage or res.Result or "Authentication failed.")

        sets = res.ResultDataSet + [[], [], []]
        if not sets[0]:                                   # role inactive or officer inactive
            return None, self._Fail(403, "No active role is assigned to this account.")
        access = {
            "role_code": sets[0][0]["role_code"],
            "home_screen": sets[0][0]["home_screen"],
            "allowed_screens": [r["screen_key"] for r in sets[1]],
            "permissions": [r["permission_code"] for r in sets[2]],
        }
        return access, None

    # ---- POST /api/auth/Login -------------------------------------------------------------
    def Login(self, requestAPI: LoginRequestAPI) -> Response:
        result = Response()

        # 1) LOGIN  -> row incl. BCrypt hash, verified in Python
        officer, failure = VerifyCredentials(requestAPI.username, requestAPI.service_number, requestAPI.password, "Login")
        if failure is not None:
            return failure
        if officer is None:
            return self._Fail(401, "Invalid credentials.")

        # 2) ACCESS -> home screen / allowed screens / permissions
        access, failure = self._LoadAccess(officer["officer_id"], "Login")
        if failure is not None:
            return failure
        if access is None:
            return self._Fail(403, "No active role is assigned to this account.")

        # 3) LOGIN_SUCCESS -> stamps last_login_at + audit
        stamp = UserRequestAPI(p_officer_id=officer["officer_id"])
        stamp.ActionType = str(AuthAction.LOGIN_SUCCESS)
        with DBconnect() as dbConnect:
            res = dbConnect.ProcedureRead(stamp, self.ProcedureName, self.ActionParam, self.HasOutput)
        if res.ResultStatusCode != "1":
            LogHandler.WriteToLog(res.ExceptionMessage or res.Result, "Login")
            return self._Fail(res.ErrorCode, res.ExceptionMessage or res.Result or "Authentication failed.")

        result.StatusCode = 200
        result.Result = "Success"
        result.ResultSet = {
            "token": CreateToken(officer["officer_id"], officer["username"], officer["service_number"], access["role_code"]),
            "token_type": "Bearer",
            "officer": {
                "officer_id": officer["officer_id"],
                "username": officer["username"],
                "service_number": officer["service_number"],
                "officer_name": officer.get("officer_name"),
                "unit_name": officer.get("unit_name"),
                "role_id": officer["role_id"],
                "role_code": officer["role_code"],
                "role_name": officer["role_name"],
                "must_change_password": bool(officer["must_change_password"]),
                "last_login_at": officer.get("last_login_at"),
            },
            "home_screen": access["home_screen"],
            "allowed_screens": access["allowed_screens"],
            "permissions": access["permissions"],
        }
        return result

    # ---- GET /api/auth/Access (refresh screens / permissions of the logged-in officer) ----
    def Access(self, officer: CurrentOfficer) -> Response:
        access, failure = self._LoadAccess(officer.officer_id, "Access")
        if failure is not None:
            return failure
        result = Response()
        result.StatusCode = 200
        result.ResultSet = access
        return result

    # ---- POST /api/auth/ChangePassword -------------------------------------------------------
    def ChangePassword(self, requestAPI: ChangePasswordRequestAPI, officer: CurrentOfficer) -> Response:
        _, failure = VerifyCredentials(officer.username, officer.service_number, requestAPI.current_password, "ChangePassword")
        if failure is not None:
            if failure.StatusCode == 401:
                failure.Result = "Current password is incorrect."
            return failure

        error = ValidateNewPassword(requestAPI.new_password)
        if error:
            return self._Fail(400, error)

        request = UserRequestAPI(p_officer_id=officer.officer_id, new_password_hash=HashPassword(requestAPI.new_password))
        return self._Execute(request, AuthAction.CHANGE_PASSWORD, "ChangePassword", "row")
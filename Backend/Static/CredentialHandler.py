"""Verifies username + service number + password (sp_auth LOGIN + BCrypt). Used by Login, ChangePassword and the sign-off officer check."""
from typing import Any, Dict, Optional, Tuple

from DataBaseConnectivity.DBConnect import DBconnect
from Models.RequestApiModels.UserRequestAPI import UserRequestAPI
from Models.Response import Response
from Static.ActionTypes import AuthAction
from Static.LogHandler import LogHandler
from Static.Security import VerifyPassword

INVALID_LOGIN = "Invalid username or Service number or password."


def VerifyCredentials(username: Optional[str], serviceNumber: Optional[str], password: Optional[str],
                      methodName: str) -> Tuple[Optional[Dict[str, Any]], Optional[Response]]:
    """Returns (officer_row, None) when valid, or (None, failure Response)."""
    failure = Response()

    if not username or not serviceNumber or not password:
        failure.StatusCode = 400
        failure.Result = "username, service_number and password are required."
        return None, failure

    request = UserRequestAPI(p_username=username, p_service_number=serviceNumber)
    request.ActionType = str(AuthAction.LOGIN)

    with DBconnect() as dbConnect:
        res = dbConnect.ProcedureRead(request, "sp_auth", actionParam="ActionType", hasOutput=True)

    if res.ResultStatusCode == "-1":                       # DB / connection error
        LogHandler.WriteToLog(res.ExceptionMessage, methodName)
        failure.StatusCode = 500
        failure.Result = res.ExceptionMessage
        return None, failure

    if res.ResultStatusCode != "1" or not res.ResultDataTable:   # unknown user or inactive account (message comes from the SP)
        failure.StatusCode = 401
        failure.Result = res.Result if res.ResultStatusCode == "0" and res.Result else INVALID_LOGIN
        return None, failure

    officer = res.ResultDataTable[0]
    if "is_active" in officer and not officer["is_active"]:       # works even if the SP does not check it
        failure.StatusCode = 401
        failure.Result = "This account is inactive. Contact the System Administrator."
        return None, failure
    if not VerifyPassword(password, officer["password"]):
        failure.StatusCode = 401
        failure.Result = INVALID_LOGIN
        return None, failure

    return officer, None
from typing import Any, Dict, List, Optional, Sequence, Tuple

from DataBaseConnectivity.DBConnect import DBconnect
from Models.Response import Response
from Static.CredentialHandler import VerifyCredentials
from Static.LogHandler import LogHandler


class DABase:
    """Shared plumbing of every DataAccess class (the part the template repeats inside each method):
       set ActionType -> DBconnect.ProcedureRead -> build Response / write the exception log."""

    ProcedureName: str = ""
    ActionParam: str = "action_type"     # parameter name of the action type in the stored procedure
    HasOutput: bool = False              # procedure declares @ResultStatusCode / @Result / @ExceptionMessage

    # sets = [("summary", "row"), ("recent", "rows")]  -> ResultSet becomes {"summary": {...}, "recent": [...]}
    def _Execute(self, requestAPI, actionType: int, methodName: str, shape: str = "rows",
                 sets: Optional[Sequence[Tuple[str, str]]] = None) -> Response:
        result = Response()
        requestAPI.ActionType = str(actionType)          # the action type is a NUMBER, sent as "1", "2" ...

        with DBconnect() as dbConnect:
            res = dbConnect.ProcedureRead(requestAPI, self.ProcedureName, self.ActionParam, self.HasOutput)

        if res.ResultStatusCode != "1":
            LogHandler.WriteToLog(res.ExceptionMessage or res.Result, methodName)
            result.StatusCode = res.ErrorCode
            result.Result = res.ExceptionMessage or res.Result
            return result

        if sets:
            data: Dict[str, Any] = {}
            for index, (name, kind) in enumerate(sets):
                table = res.ResultDataSet[index] if index < len(res.ResultDataSet) else []
                data[name] = self._Shape(table, kind)
            result.ResultSet = data
        elif shape == "row":
            if not res.ResultDataTable:
                result.StatusCode = 404
                result.Result = "Record not found."
                return result
            result.ResultSet = res.ResultDataTable[0]
        else:
            result.ResultSet = res.ResultDataTable

        result.StatusCode = 200
        return result

    @staticmethod
    def _Shape(table: List[Dict[str, Any]], kind: str):
        return (table[0] if table else None) if kind == "row" else table

    @staticmethod
    def _Fail(statusCode: int, message: str) -> Response:
        result = Response()
        result.StatusCode = statusCode
        result.Result = message
        return result

    @staticmethod
    def _VerifySignoff(requestAPI, methodName: str) -> Optional[Response]:
        """Checks the authorizing officer's credentials. On success sets requestAPI.signoff_officer_id and returns None;
        on failure returns the failure Response. The client can never choose signoff_officer_id itself."""
        requestAPI.signoff_officer_id = None
        officer, failure = VerifyCredentials(requestAPI.signoff_username, requestAPI.signoff_service_number,
                                             requestAPI.signoff_password, methodName)
        if failure is not None:
            failure.Result = "Sign-off failed: " + (failure.Result or "")
            return failure
        requestAPI.signoff_officer_id = officer["officer_id"]
        return None

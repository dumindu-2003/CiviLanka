import json
import re
from typing import Any, Dict, List, Optional, Sequence

import pyodbc

import AppSettings
from Models.ProcedureDBModel import ProcedureDBModel
from Models.RequestAPI import RequestAPI

# SQL Server THROW numbers used by the stored procedures  ->  HTTP-style status codes
_ERROR_CODES = {50400: 400, 50401: 401, 50403: 403, 50404: 404, 50409: 409, 50410: 409, 50411: 409, 50420: 403}


def ParseSqlError(ex: Exception):
    """Returns (status_code, clean_message) for an exception raised by pyodbc."""
    text = " ".join(str(a) for a in ex.args) if ex.args else str(ex)
    number = re.search(r"\((50\d{3})\)", text)
    segment = re.search(r"\[SQL Server\](.*?)(?=\[SQL Server\]|$)", text, re.S)
    message = segment.group(1) if segment else text
    message = re.sub(r"\s*\(\d+\)(\s*\(SQL\w+\))?\s*$", "", message.strip()).strip()
    code = _ERROR_CODES.get(int(number.group(1)), 500) if number else 500
    return code, message


class DBconnect:
    def __init__(self):
        self._connectionString = AppSettings.CONNECTION_STRING
        self._connection = None

    # ---- connection -------------------------------------------------------------------
    def GetOpenConnection(self):
        # autocommit: the stored procedures manage their own BEGIN TRAN / COMMIT (same as ADO.NET)
        return pyodbc.connect(self._connectionString, autocommit=True)

    @staticmethod
    def _ToRows(cursor) -> List[Dict[str, Any]]:
        columns = [c[0] for c in cursor.description]
        return [dict(zip(columns, tuple(row))) for row in cursor.fetchall()]

    @staticmethod
    def _ToSqlValue(value: Any) -> Any:
        if isinstance(value, (dict, list)):
            return json.dumps(value, ensure_ascii=False, default=str)   # @data / @json_ids -> NVARCHAR(MAX) JSON
        return value

    # ---- plain SQL --------------------------------------------------------------------
    def ReadTable(self, readStr: str, params: Sequence[Any] = ()) -> List[Dict[str, Any]]:
        connection = self.GetOpenConnection()
        try:
            cursor = connection.cursor()
            cursor.execute(readStr, list(params))
            return self._ToRows(cursor) if cursor.description else []
        finally:
            connection.close()

    def AddEditDel(self, addEditDelStr: str, params: Sequence[Any] = ()) -> bool:
        connection = self.GetOpenConnection()
        try:
            cursor = connection.cursor()
            cursor.execute(addEditDelStr, list(params))
            return cursor.rowcount > 0
        finally:
            connection.close()

    # ---- stored procedure -------------------------------------------------------------
    def ProcedureRead(self, requestAPI: RequestAPI, procedureName: str,
                      actionParam: str = "action_type", hasOutput: bool = False) -> ProcedureDBModel:
        """
        Maps every property of requestAPI to @property and EXECs the procedure.
        - ActionType is sent as @<actionParam>  (sp_auth uses '@ActionType', the others '@action_type')
        - properties that are None are NOT sent, so the SQL default values apply (@filter = 'All', @publish = 0 ...)
        - hasOutput=True  -> also reads @ResultStatusCode / @Result / @ExceptionMessage (only sp_auth declares them)
        """
        result = ProcedureDBModel()
        if not re.fullmatch(r"[A-Za-z0-9_.]+", procedureName):
            raise ValueError("Invalid procedure name.")

        ignore = type(requestAPI).DB_IGNORE
        parts: List[str] = []
        values: List[Any] = []
        for field in type(requestAPI).model_fields:
            if field in ignore:
                continue
            value = getattr(requestAPI, field)
            if value is None:
                continue
            parts.append(f"@{actionParam if field == 'ActionType' else field}=?")
            values.append(self._ToSqlValue(value))

        if hasOutput:
            parts += ["@ResultStatusCode=@ResultStatusCode OUTPUT", "@Result=@Result OUTPUT",
                      "@ExceptionMessage=@ExceptionMessage OUTPUT"]
            sql = ("SET NOCOUNT ON; DECLARE @ResultStatusCode INT, @Result VARCHAR(MAX), @ExceptionMessage VARCHAR(MAX); "
                   f"EXEC dbo.{procedureName} {', '.join(parts)}; "
                   "SELECT @ResultStatusCode AS ResultStatusCode, @Result AS Result, @ExceptionMessage AS ExceptionMessage;")
        else:
            sql = f"SET NOCOUNT ON; EXEC dbo.{procedureName} {', '.join(parts)};"

        connection = None
        try:
            connection = self.GetOpenConnection()
            cursor = connection.cursor()
            cursor.execute(sql, values)

            sets: List[List[Dict[str, Any]]] = []
            while True:
                if cursor.description:
                    sets.append(self._ToRows(cursor))
                if not cursor.nextset():
                    break

            if hasOutput:
                status = sets.pop()[0] if sets else {}
                code = status.get("ResultStatusCode")
                result.ResultStatusCode = str(code) if code is not None else "1"
                result.Result = status.get("Result") or "Success"
                result.ExceptionMessage = status.get("ExceptionMessage")
                if result.ResultStatusCode != "1":
                    result.ErrorCode = 400
            else:
                result.ResultStatusCode = "1"
                result.Result = "Success"

            result.ResultDataSet = sets
            result.ResultDataTable = sets[0] if sets else []
        except Exception as ex:                      # THROW from the procedure, or a connection problem
            result.ErrorCode, result.ExceptionMessage = ParseSqlError(ex)
            result.ResultStatusCode = "-1"
        finally:
            if connection is not None:
                connection.close()

        return result

    # ---- IDisposable ------------------------------------------------------------------
    def Dispose(self):
        if self._connection is not None:
            self._connection.close()
            self._connection = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        self.Dispose()

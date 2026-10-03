from Interfaces.IAudit import IAudit
from DataAccess.DABase import DABase
from Models.RequestApiModels.AuditRequestAPI import AuditRequestAPI
from Models.Response import Response
from Static.ActionTypes import AuditAction



class DAAudit(DABase, IAudit):
    ProcedureName = "sp_audit"

    def List(self, requestAPI: AuditRequestAPI) -> Response:
        return self._Execute(requestAPI, AuditAction.LIST, "List", "rows")

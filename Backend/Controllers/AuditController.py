from fastapi import APIRouter, Depends

from App_Start import UnityConfig
from Interfaces.IAudit import IAudit
from Models.RequestApiModels.AuditRequestAPI import AuditRequestAPI
from Models.Response import Response
from Static.Security import CurrentOfficer, GetCurrentOfficer

router = APIRouter(prefix="/api/audit", tags=["Audit"])


def GetAudit() -> IAudit:
    return UnityConfig.Resolve(IAudit)


@router.get("/List", response_model=Response)
def List(requestAPI: AuditRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Audit: IAudit = Depends(GetAudit)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Audit.List(requestAPI)

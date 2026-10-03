from fastapi import APIRouter, Depends

from App_Start import UnityConfig
from Interfaces.IAdmin import IAdmin
from Models.RequestApiModels.AdminRequestAPI import AdminRequestAPI, AdminSetRequestAPI
from Models.Response import Response
from Static.Security import CurrentOfficer, GetCurrentOfficer

router = APIRouter(prefix="/api/admin", tags=["Admin"])


def GetAdmin() -> IAdmin:
    return UnityConfig.Resolve(IAdmin)


@router.get("/RoleList", response_model=Response)
def RoleList(requestAPI: AdminRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.RoleList(requestAPI)


@router.post("/RoleCreate", response_model=Response)
def RoleCreate(requestAPI: AdminRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.RoleCreate(requestAPI)


@router.post("/RoleUpdate", response_model=Response)
def RoleUpdate(requestAPI: AdminRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.RoleUpdate(requestAPI)


@router.post("/RoleSetActive", response_model=Response)
def RoleSetActive(requestAPI: AdminRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.RoleSetActive(requestAPI)


@router.post("/RoleDelete", response_model=Response)
def RoleDelete(requestAPI: AdminRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.RoleDelete(requestAPI)


@router.get("/PermissionList", response_model=Response)
def PermissionList(requestAPI: AdminRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.PermissionList(requestAPI)


@router.get("/RolePermissionList", response_model=Response)
def RolePermissionList(requestAPI: AdminRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.RolePermissionList(requestAPI)


@router.post("/RolePermissionSet", response_model=Response)
def RolePermissionSet(requestAPI: AdminSetRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.RolePermissionSet(requestAPI)


@router.get("/ScreenList", response_model=Response)
def ScreenList(requestAPI: AdminRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.ScreenList(requestAPI)


@router.get("/RoleScreenList", response_model=Response)
def RoleScreenList(requestAPI: AdminRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.RoleScreenList(requestAPI)


@router.post("/RoleScreenSet", response_model=Response)
def RoleScreenSet(requestAPI: AdminSetRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.RoleScreenSet(requestAPI)


@router.get("/OfficerList", response_model=Response)
def OfficerList(requestAPI: AdminRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.OfficerList(requestAPI)


@router.post("/OfficerCreate", response_model=Response)
def OfficerCreate(requestAPI: AdminRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.OfficerCreate(requestAPI)


@router.post("/OfficerSetRole", response_model=Response)
def OfficerSetRole(requestAPI: AdminRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.OfficerSetRole(requestAPI)


@router.post("/OfficerSetActive", response_model=Response)
def OfficerSetActive(requestAPI: AdminRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.OfficerSetActive(requestAPI)


@router.post("/OfficerResetPassword", response_model=Response)
def OfficerResetPassword(requestAPI: AdminRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.OfficerResetPassword(requestAPI)


@router.get("/Dashboard", response_model=Response)
def Dashboard(requestAPI: AdminRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Admin: IAdmin = Depends(GetAdmin)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Admin.Dashboard(requestAPI)

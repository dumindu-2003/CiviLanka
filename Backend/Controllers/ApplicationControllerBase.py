"""Builds the router shared by Birth / Death / Marriage / NIC (identical actions)."""
from fastapi import APIRouter, Depends

from App_Start import UnityConfig
from Interfaces.IApplication import IApplication
from Models.RequestApiModels.ApplicationRequestAPI import ApplicationRequestAPI, ApplicationSaveRequestAPI
from Models.Response import Response
from Static.Security import CurrentOfficer, GetCurrentOfficer


def BuildApplicationRouter(prefix: str, tag: str, interface: type, withDashboard: bool) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=[tag])

    def GetService() -> IApplication:
        return UnityConfig.Resolve(interface)

    if withDashboard:
        @router.get("/Dashboard", response_model=Response)
        def Dashboard(requestAPI: ApplicationRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer),
                      _Service: IApplication = Depends(GetService)):
            requestAPI.acting_officer_id = officer.officer_id
            return _Service.Dashboard(requestAPI)

    @router.get("/List", response_model=Response)
    def List(requestAPI: ApplicationRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer),
             _Service: IApplication = Depends(GetService)):
        requestAPI.acting_officer_id = officer.officer_id
        return _Service.List(requestAPI)

    @router.get("/Get", response_model=Response)
    def Get(requestAPI: ApplicationRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer),
            _Service: IApplication = Depends(GetService)):
        requestAPI.acting_officer_id = officer.officer_id
        return _Service.Get(requestAPI)

    @router.post("/Create", response_model=Response)
    def Create(requestAPI: ApplicationSaveRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer),
               _Service: IApplication = Depends(GetService)):
        requestAPI.acting_officer_id = officer.officer_id
        return _Service.Create(requestAPI)

    @router.post("/Update", response_model=Response)
    def Update(requestAPI: ApplicationSaveRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer),
               _Service: IApplication = Depends(GetService)):
        requestAPI.acting_officer_id = officer.officer_id
        return _Service.Update(requestAPI)

    @router.post("/Submit", response_model=Response)
    def Submit(requestAPI: ApplicationSaveRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer),
               _Service: IApplication = Depends(GetService)):
        requestAPI.acting_officer_id = officer.officer_id
        return _Service.Submit(requestAPI)

    @router.post("/Delete", response_model=Response)
    def Delete(requestAPI: ApplicationSaveRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer),
               _Service: IApplication = Depends(GetService)):
        requestAPI.acting_officer_id = officer.officer_id
        return _Service.Delete(requestAPI)

    return router

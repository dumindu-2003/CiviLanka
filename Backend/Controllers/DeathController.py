from fastapi import Depends

from App_Start import UnityConfig
from Controllers.ApplicationControllerBase import BuildApplicationRouter
from Interfaces.IDeath import IDeath
from Models.RequestApiModels.ApplicationRequestAPI import ApplicationSaveRequestAPI
from Models.Response import Response
from Static.Security import CurrentOfficer, GetCurrentOfficer

router = BuildApplicationRouter("/api/death", "Death", IDeath, True)


def GetDeath() -> IDeath:
    return UnityConfig.Resolve(IDeath)


@router.post("/Decide", response_model=Response)
def Decide(requestAPI: ApplicationSaveRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer),
           _Death: IDeath = Depends(GetDeath)):
    requestAPI.acting_officer_id = officer.officer_id
    return _Death.Decide(requestAPI)

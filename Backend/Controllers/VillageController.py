from fastapi import APIRouter, Depends

from App_Start import UnityConfig
from Interfaces.IVillage import IVillage
from Models.RequestApiModels.VillageRequestAPI import VillageRequestAPI
from Models.Response import Response
from Static.Security import CurrentOfficer, GetCurrentOfficer

router = APIRouter(prefix="/api/village", tags=["Village"])


def GetVillage() -> IVillage:
    return UnityConfig.Resolve(IVillage)


@router.get("/Dashboard", response_model=Response)
def Dashboard(requestAPI: VillageRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Village: IVillage = Depends(GetVillage)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Village.Dashboard(requestAPI)


@router.get("/Certificates", response_model=Response)
def Certificates(requestAPI: VillageRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Village: IVillage = Depends(GetVillage)):
    requestAPI.acting_officer_id = officer.officer_id
    return _Village.Preview(requestAPI)

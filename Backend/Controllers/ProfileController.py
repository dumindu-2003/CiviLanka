from fastapi import APIRouter, Depends

from App_Start import UnityConfig
from Interfaces.IProfile import IProfile
from Models.RequestApiModels.ProfileRequestAPI import ProfileRequestAPI
from Models.Response import Response
from Static.Security import CurrentOfficer, GetCurrentOfficer

router = APIRouter(prefix="/api/profile", tags=["Profile"])


def GetProfile() -> IProfile:
    return UnityConfig.Resolve(IProfile)


@router.get("/Get", response_model=Response)
def Get(requestAPI: ProfileRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Profile: IProfile = Depends(GetProfile)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Profile.Get(requestAPI)


@router.post("/UpdateContact", response_model=Response)
def UpdateContact(requestAPI: ProfileRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Profile: IProfile = Depends(GetProfile)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Profile.UpdateContact(requestAPI)

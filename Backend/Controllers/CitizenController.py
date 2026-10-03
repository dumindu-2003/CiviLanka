from fastapi import APIRouter, Depends

from App_Start import UnityConfig
from Interfaces.ICitizen import ICitizen
from Models.RequestApiModels.CitizenRequestAPI import CitizenRequestAPI, CitizenSaveRequestAPI
from Models.Response import Response
from Static.Security import CurrentOfficer, GetCurrentOfficer

router = APIRouter(prefix="/api/citizen", tags=["Citizen"])


def GetCitizen() -> ICitizen:
    return UnityConfig.Resolve(ICitizen)


@router.get("/Search", response_model=Response)
def Search(requestAPI: CitizenRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Citizen: ICitizen = Depends(GetCitizen)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Citizen.Search(requestAPI)


@router.get("/Get", response_model=Response)
def Get(requestAPI: CitizenRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Citizen: ICitizen = Depends(GetCitizen)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Citizen.Get(requestAPI)


@router.post("/Create", response_model=Response)
def Create(requestAPI: CitizenSaveRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Citizen: ICitizen = Depends(GetCitizen)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Citizen.Create(requestAPI)


@router.post("/Update", response_model=Response)
def Update(requestAPI: CitizenSaveRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Citizen: ICitizen = Depends(GetCitizen)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Citizen.Update(requestAPI)

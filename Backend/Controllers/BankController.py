from fastapi import APIRouter, Depends

from App_Start import UnityConfig
from Interfaces.IBank import IBank
from Models.RequestApiModels.BankRequestAPI import BankRequestAPI
from Models.Response import Response
from Static.Security import CurrentOfficer, GetCurrentOfficer

router = APIRouter(prefix="/api/bank", tags=["Bank"])


def GetBank() -> IBank:
    return UnityConfig.Resolve(IBank)


@router.get("/Verify", response_model=Response)
def Verify(requestAPI: BankRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Bank: IBank = Depends(GetBank)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Bank.Verify(requestAPI)


@router.get("/Recent", response_model=Response)
def Recent(requestAPI: BankRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Bank: IBank = Depends(GetBank)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Bank.Recent(requestAPI)

from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse

from App_Start import UnityConfig
from Interfaces.IAuth import IAuth
from Models.RequestApiModels.UserRequestAPI import ChangePasswordRequestAPI, LoginRequestAPI
from Models.Response import Response
from Static.Security import CurrentOfficer, GetCurrentOfficer, HashPassword as GeneratePasswordHash

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def GetAuth() -> IAuth:
    return UnityConfig.Resolve(IAuth)


@router.get("/HashPassword", response_class=PlainTextResponse)
def HashPassword():
    password = "Password@123"
    return GeneratePasswordHash(password)


@router.post("/Login", response_model=Response)
def Login(requestAPI: LoginRequestAPI, _Auth: IAuth = Depends(GetAuth)):
    return _Auth.Login(requestAPI)


@router.get("/Access", response_model=Response)
def Access(officer: CurrentOfficer = Depends(GetCurrentOfficer), _Auth: IAuth = Depends(GetAuth)):
    return _Auth.Access(officer)


@router.post("/ChangePassword", response_model=Response)
def ChangePassword(requestAPI: ChangePasswordRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer),
                   _Auth: IAuth = Depends(GetAuth)):
    return _Auth.ChangePassword(requestAPI, officer)

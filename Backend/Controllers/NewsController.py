from fastapi import APIRouter, Depends

from App_Start import UnityConfig
from Interfaces.INews import INews
from Models.RequestApiModels.NewsRequestAPI import NewsRequestAPI
from Models.Response import Response
from Static.Security import CurrentOfficer, GetCurrentOfficer

router = APIRouter(prefix="/api/news", tags=["News"])


def GetNews() -> INews:
    return UnityConfig.Resolve(INews)


@router.get("/List", response_model=Response)
def List(requestAPI: NewsRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _News: INews = Depends(GetNews)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _News.List(requestAPI)


@router.get("/Get", response_model=Response)
def Get(requestAPI: NewsRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _News: INews = Depends(GetNews)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _News.Get(requestAPI)


@router.post("/Create", response_model=Response)
def Create(requestAPI: NewsRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _News: INews = Depends(GetNews)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _News.Create(requestAPI)


@router.post("/Update", response_model=Response)
def Update(requestAPI: NewsRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _News: INews = Depends(GetNews)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _News.Update(requestAPI)


@router.post("/Publish", response_model=Response)
def Publish(requestAPI: NewsRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _News: INews = Depends(GetNews)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _News.Publish(requestAPI)


@router.post("/Unpublish", response_model=Response)
def Unpublish(requestAPI: NewsRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _News: INews = Depends(GetNews)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _News.Unpublish(requestAPI)


@router.post("/Delete", response_model=Response)
def Delete(requestAPI: NewsRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _News: INews = Depends(GetNews)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _News.Delete(requestAPI)

from fastapi import APIRouter, Depends

from App_Start import UnityConfig
from Interfaces.INotification import INotification
from Models.RequestApiModels.NotificationRequestAPI import NotificationRequestAPI
from Models.Response import Response
from Static.Security import CurrentOfficer, GetCurrentOfficer

router = APIRouter(prefix="/api/notification", tags=["Notification"])


def GetNotification() -> INotification:
    return UnityConfig.Resolve(INotification)


@router.get("/List", response_model=Response)
def List(requestAPI: NotificationRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Notification: INotification = Depends(GetNotification)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Notification.List(requestAPI)


@router.get("/UnreadCount", response_model=Response)
def UnreadCount(requestAPI: NotificationRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Notification: INotification = Depends(GetNotification)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Notification.UnreadCount(requestAPI)


@router.post("/MarkRead", response_model=Response)
def MarkRead(requestAPI: NotificationRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Notification: INotification = Depends(GetNotification)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Notification.MarkRead(requestAPI)


@router.post("/MarkAllRead", response_model=Response)
def MarkAllRead(requestAPI: NotificationRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Notification: INotification = Depends(GetNotification)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Notification.MarkAllRead(requestAPI)


@router.post("/Delete", response_model=Response)
def Delete(requestAPI: NotificationRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _Notification: INotification = Depends(GetNotification)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _Notification.Delete(requestAPI)

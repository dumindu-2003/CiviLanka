from fastapi import APIRouter, Depends

from App_Start import UnityConfig
from Interfaces.IDistrict import IDistrict
from Models.RequestApiModels.DistrictRequestAPI import DistrictRequestAPI, DistrictDecisionRequestAPI
from Models.Response import Response
from Static.Security import CurrentOfficer, GetCurrentOfficer

router = APIRouter(prefix="/api/district", tags=["District"])


def GetDistrict() -> IDistrict:
    return UnityConfig.Resolve(IDistrict)


@router.get("/Summary", response_model=Response)
def Summary(requestAPI: DistrictRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _District: IDistrict = Depends(GetDistrict)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _District.Summary(requestAPI)


@router.get("/List", response_model=Response)
def List(requestAPI: DistrictRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _District: IDistrict = Depends(GetDistrict)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _District.List(requestAPI)


@router.get("/Get", response_model=Response)
def Get(requestAPI: DistrictRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _District: IDistrict = Depends(GetDistrict)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _District.Get(requestAPI)


@router.get("/NicPendingList", response_model=Response)
def NicPendingList(requestAPI: DistrictRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _District: IDistrict = Depends(GetDistrict)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _District.NicPendingList(requestAPI)


@router.post("/Approve", response_model=Response)
def Approve(requestAPI: DistrictDecisionRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _District: IDistrict = Depends(GetDistrict)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _District.Approve(requestAPI)


@router.post("/Reject", response_model=Response)
def Reject(requestAPI: DistrictDecisionRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _District: IDistrict = Depends(GetDistrict)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _District.Reject(requestAPI)


@router.post("/ReportGenerate", response_model=Response)
def ReportGenerate(requestAPI: DistrictRequestAPI, officer: CurrentOfficer = Depends(GetCurrentOfficer), _District: IDistrict = Depends(GetDistrict)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _District.ReportGenerate(requestAPI)


@router.get("/ReportList", response_model=Response)
def ReportList(requestAPI: DistrictRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _District: IDistrict = Depends(GetDistrict)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _District.ReportList(requestAPI)


@router.get("/ReportTrend", response_model=Response)
def ReportTrend(requestAPI: DistrictRequestAPI = Depends(), officer: CurrentOfficer = Depends(GetCurrentOfficer), _District: IDistrict = Depends(GetDistrict)):
    requestAPI.acting_officer_id = officer.officer_id          # from the JWT, never from the client
    return _District.ReportTrend(requestAPI)

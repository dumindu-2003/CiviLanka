from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import FileResponse

import AppSettings
from App_Start import UnityConfig
from Interfaces.IProfile import IProfile
from Models.RequestApiModels.ProfileRequestAPI import ProfilePhotoRequestAPI, ProfileRequestAPI
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


# ---------------------------------------- profile photo ----------------------------------------
@router.post("/PhotoUpload", response_model=Response)
def PhotoUpload(file: UploadFile = File(...), officer: CurrentOfficer = Depends(GetCurrentOfficer), _Profile: IProfile = Depends(GetProfile)):
    """multipart/form-data, field name = file  (JPG / PNG / WEBP, max 2 MB). The image is saved in the Uploads folder."""
    fileBytes = file.file.read(AppSettings.MAX_PHOTO_BYTES + 1)           # one byte more than the limit, to detect "too big"
    requestAPI = ProfilePhotoRequestAPI(acting_officer_id=officer.officer_id, original_file_name=file.filename)
    return _Profile.PhotoUpload(requestAPI, fileBytes)


@router.get("/PhotoGet", response_model=Response)
def PhotoGet(officer: CurrentOfficer = Depends(GetCurrentOfficer), _Profile: IProfile = Depends(GetProfile)):
    return _Profile.PhotoGet(ProfilePhotoRequestAPI(acting_officer_id=officer.officer_id))


@router.get("/PhotoFile")
def PhotoFile(officer: CurrentOfficer = Depends(GetCurrentOfficer), _Profile: IProfile = Depends(GetProfile)):
    """Returns the image itself (use it as the source of an <Image>). Needs the Bearer token."""
    res = _Profile.PhotoFile(ProfilePhotoRequestAPI(acting_officer_id=officer.officer_id))
    if res.StatusCode != 200:
        return res

    result_set = res.ResultSet
    if result_set is None:
        return res

    return FileResponse(result_set["path"], media_type=result_set["content_type"])


@router.post("/PhotoDelete", response_model=Response)
def PhotoDelete(officer: CurrentOfficer = Depends(GetCurrentOfficer), _Profile: IProfile = Depends(GetProfile)):
    return _Profile.PhotoDelete(ProfilePhotoRequestAPI(acting_officer_id=officer.officer_id))
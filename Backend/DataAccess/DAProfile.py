import os

import AppSettings
from DataAccess.DABase import DABase
from Interfaces.IProfile import IProfile
from Models.RequestApiModels.ProfileRequestAPI import ProfilePhotoRequestAPI, ProfileRequestAPI
from Models.Response import Response
from Static.ActionTypes import ProfileAction
from Static.FileHandler import FileHandler
from Static.LogHandler import LogHandler


class DAProfile(DABase, IProfile):
    ProcedureName = "sp_profile"

    def Get(self, requestAPI: ProfileRequestAPI) -> Response:
        return self._Execute(requestAPI, ProfileAction.GET, "Get", "row")

    def UpdateContact(self, requestAPI: ProfileRequestAPI) -> Response:
        return self._Execute(requestAPI, ProfileAction.UPDATE_CONTACT, "UpdateContact", "row")

    # ---- POST /api/profile/PhotoUpload --------------------------------------------------------
    def PhotoUpload(self, requestAPI: ProfilePhotoRequestAPI, fileBytes: bytes) -> Response:
        if not fileBytes:
            return self._Fail(400, "No file was uploaded.")
        if len(fileBytes) > AppSettings.MAX_PHOTO_BYTES:
            return self._Fail(400, "The photo must be 2 MB or smaller.")

        kind = FileHandler.DetectImage(fileBytes)                 # real file type, not the one the client claims
        if kind is None:
            return self._Fail(400, "Only JPG, PNG or WEBP images are allowed.")

        requestAPI.content_type, requestAPI.file_ext = kind
        requestAPI.file_size_bytes = len(fileBytes)
        requestAPI.original_file_name = os.path.basename((requestAPI.original_file_name or "photo" + kind[1]).replace("\\", "/"))[:255]

        # 1) SQL inserts the record and builds the file name from SCOPE_IDENTITY()
        saved = self._Execute(requestAPI, ProfileAction.PHOTO_UPLOAD, "PhotoUpload", "row")
        if saved.StatusCode != 200:
            return saved

        row = saved.ResultSet or {}
        if not row or "photo_id" not in row or "stored_file_name" not in row:
            return self._Fail(500, "The photo record was not created correctly.")

        # 2) the backend writes the file into the Uploads folder
        try:
            FileHandler.Save(row["stored_file_name"], fileBytes)
        except OSError as ex:
            LogHandler.WriteToLog(str(ex), "PhotoUpload")
            undo = ProfilePhotoRequestAPI(acting_officer_id=requestAPI.acting_officer_id, photo_id=row["photo_id"])
            self._Execute(undo, ProfileAction.PHOTO_DELETE, "PhotoUpload", "row")        # status change, no physical delete
            return self._Fail(500, "The photo could not be saved on the server.")

        saved.ResultSet = {"photo_id": row["photo_id"], "file_name": row["stored_file_name"], "url": "/api/profile/PhotoFile"}
        return saved

    # ---- GET /api/profile/PhotoGet -------------------------------------------------------------
    def PhotoGet(self, requestAPI: ProfilePhotoRequestAPI) -> Response:
        result = self._Execute(requestAPI, ProfileAction.PHOTO_GET, "PhotoGet", "row")
        if result.StatusCode == 404:
            result.Result = "No profile photo uploaded yet."
        elif result.StatusCode == 200:
            if not result.ResultSet:
                return self._Fail(404, "No profile photo uploaded yet.")
            result.ResultSet["url"] = "/api/profile/PhotoFile"
        return result

    # ---- GET /api/profile/PhotoFile  (ResultSet = path + content type, the controller streams the file) ----
    def PhotoFile(self, requestAPI: ProfilePhotoRequestAPI) -> Response:
        result = self._Execute(requestAPI, ProfileAction.PHOTO_GET, "PhotoFile", "row")
        if result.StatusCode == 404:
            result.Result = "No profile photo uploaded yet."
            return result
        if result.StatusCode != 200:
            return result

        if not result.ResultSet:
            return self._Fail(404, "No profile photo uploaded yet.")

        path = FileHandler.PathOf(result.ResultSet["stored_file_name"])
        if not os.path.isfile(path):
            return self._Fail(404, "The photo file is missing on the server.")
        result.ResultSet = {"path": path, "content_type": result.ResultSet["content_type"]}
        return result

    # ---- POST /api/profile/PhotoDelete  (status change: is_deleted = 1) ------------------------------
    def PhotoDelete(self, requestAPI: ProfilePhotoRequestAPI) -> Response:
        return self._Execute(requestAPI, ProfileAction.PHOTO_DELETE, "PhotoDelete", "row")
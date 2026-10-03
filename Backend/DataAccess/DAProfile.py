from Interfaces.IProfile import IProfile
from DataAccess.DABase import DABase
from Models.RequestApiModels.ProfileRequestAPI import ProfileRequestAPI
from Models.Response import Response
from Static.ActionTypes import ProfileAction



class DAProfile(DABase, IProfile):
    ProcedureName = "sp_profile"

    def Get(self, requestAPI: ProfileRequestAPI) -> Response:
        return self._Execute(requestAPI, ProfileAction.GET, "Get", "row")

    def UpdateContact(self, requestAPI: ProfileRequestAPI) -> Response:
        return self._Execute(requestAPI, ProfileAction.UPDATE_CONTACT, "UpdateContact", "row")

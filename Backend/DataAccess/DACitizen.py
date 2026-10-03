from Interfaces.ICitizen import ICitizen
from DataAccess.DABase import DABase
from Models.RequestApiModels.CitizenRequestAPI import CitizenRequestAPI, CitizenSaveRequestAPI
from Models.Response import Response
from Static.ActionTypes import CitizenAction



class DACitizen(DABase, ICitizen):
    ProcedureName = "sp_citizen"

    def Search(self, requestAPI: CitizenRequestAPI) -> Response:
        return self._Execute(requestAPI, CitizenAction.SEARCH, "Search", "rows")

    def Get(self, requestAPI: CitizenRequestAPI) -> Response:
        return self._Execute(requestAPI, CitizenAction.GET, "Get", "row")

    def Create(self, requestAPI: CitizenSaveRequestAPI) -> Response:
        return self._Execute(requestAPI, CitizenAction.CREATE, "Create", "row")

    def Update(self, requestAPI: CitizenSaveRequestAPI) -> Response:
        return self._Execute(requestAPI, CitizenAction.UPDATE, "Update", "row")

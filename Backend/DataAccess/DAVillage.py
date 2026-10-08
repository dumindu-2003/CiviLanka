from Interfaces.IVillage import IVillage
from DataAccess.DABase import DABase
from Models.RequestApiModels.VillageRequestAPI import VillageRequestAPI
from Models.Response import Response
from Static.ActionTypes import VillageAction



class DAVillage(DABase, IVillage):
    ProcedureName = "sp_village"

    def Dashboard(self, requestAPI: VillageRequestAPI) -> Response:
        return self._Execute(requestAPI, VillageAction.DASHBOARD, "Dashboard", sets=[('recentCertificates', 'rows'), ('myPendingNic', 'row')])

    def Preview(self, requestAPI: VillageRequestAPI) -> Response:
        return self._Execute(requestAPI, VillageAction.PREVIEW, "Preview", "rows")

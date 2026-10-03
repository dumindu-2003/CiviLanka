from Interfaces.IBank import IBank
from DataAccess.DABase import DABase
from Models.RequestApiModels.BankRequestAPI import BankRequestAPI
from Models.Response import Response
from Static.ActionTypes import BankAction



class DABank(DABase, IBank):
    ProcedureName = "sp_bank"

    def Verify(self, requestAPI: BankRequestAPI) -> Response:
        return self._Execute(requestAPI, BankAction.VERIFY, "Verify", sets=[('verification', 'row'), ('approvedApplications', 'rows'), ('linkedRecords', 'rows')])

    def Recent(self, requestAPI: BankRequestAPI) -> Response:
        return self._Execute(requestAPI, BankAction.RECENT, "Recent", "rows")

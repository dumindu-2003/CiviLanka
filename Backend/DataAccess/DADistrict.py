# from Interfaces.IDistrict import IDistrict
# from DataAccess.DABase import DABase
# from Models.RequestApiModels.DistrictRequestAPI import DistrictRequestAPI, DistrictDecisionRequestAPI
# from Models.Response import Response
# from Static.ActionTypes import DistrictAction



# class DADistrict(DABase, IDistrict):
#     ProcedureName = "sp_district"

#     def Summary(self, requestAPI: DistrictRequestAPI) -> Response:
#         return self._Execute(requestAPI, DistrictAction.SUMMARY, "Summary", "row")

#     def List(self, requestAPI: DistrictRequestAPI) -> Response:
#         return self._Execute(requestAPI, DistrictAction.LIST, "List", "rows")

#     def Get(self, requestAPI: DistrictRequestAPI) -> Response:
#         return self._Execute(requestAPI, DistrictAction.GET, "Get", "row")

#     def NicPendingList(self, requestAPI: DistrictRequestAPI) -> Response:
#         return self._Execute(requestAPI, DistrictAction.NIC_PENDING_LIST, "NicPendingList", "rows")

#     def Approve(self, requestAPI: DistrictDecisionRequestAPI) -> Response:
#         failure = self._VerifySignoff(requestAPI, "Approve")
#         if failure is not None:
#             return failure
#         return self._Execute(requestAPI, DistrictAction.APPROVE, "Approve", "row")

#     def Reject(self, requestAPI: DistrictDecisionRequestAPI) -> Response:
#         failure = self._VerifySignoff(requestAPI, "Reject")
#         if failure is not None:
#             return failure
#         return self._Execute(requestAPI, DistrictAction.REJECT, "Reject", "row")

#     def ReportGenerate(self, requestAPI: DistrictRequestAPI) -> Response:
#         return self._Execute(requestAPI, DistrictAction.REPORT_GENERATE, "ReportGenerate", sets=[('report', 'row'), ('byCategory', 'rows')])

#     def ReportList(self, requestAPI: DistrictRequestAPI) -> Response:
#         return self._Execute(requestAPI, DistrictAction.REPORT_LIST, "ReportList", "rows")

#     def ReportTrend(self, requestAPI: DistrictRequestAPI) -> Response:
#         return self._Execute(requestAPI, DistrictAction.REPORT_TREND, "ReportTrend", "rows")


from Interfaces.IDistrict import IDistrict
from DataAccess.DABase import DABase
from Models.RequestApiModels.DistrictRequestAPI import (
    DistrictDecisionRequestAPI, DistrictOfficerCreateRequestAPI, DistrictRequestAPI,
)
from Models.Response import Response
from Static.ActionTypes import DistrictAction
from Static.Security import HashPassword, ValidateNewPassword



class DADistrict(DABase, IDistrict):
    ProcedureName = "sp_district"

    def Summary(self, requestAPI: DistrictRequestAPI) -> Response:
        return self._Execute(requestAPI, DistrictAction.SUMMARY, "Summary", "row")

    def List(self, requestAPI: DistrictRequestAPI) -> Response:
        return self._Execute(requestAPI, DistrictAction.LIST, "List", "rows")

    def Get(self, requestAPI: DistrictRequestAPI) -> Response:
        return self._Execute(requestAPI, DistrictAction.GET, "Get", "row")

    def NicPendingList(self, requestAPI: DistrictRequestAPI) -> Response:
        return self._Execute(requestAPI, DistrictAction.NIC_PENDING_LIST, "NicPendingList", "rows")

    def Approve(self, requestAPI: DistrictDecisionRequestAPI) -> Response:
        failure = self._VerifySignoff(requestAPI, "Approve")
        if failure is not None:
            return failure
        return self._Execute(requestAPI, DistrictAction.APPROVE, "Approve", "row")

    def Reject(self, requestAPI: DistrictDecisionRequestAPI) -> Response:
        failure = self._VerifySignoff(requestAPI, "Reject")
        if failure is not None:
            return failure
        return self._Execute(requestAPI, DistrictAction.REJECT, "Reject", "row")

    def ReportGenerate(self, requestAPI: DistrictRequestAPI) -> Response:
        return self._Execute(requestAPI, DistrictAction.REPORT_GENERATE, "ReportGenerate", sets=[('report', 'row'), ('byCategory', 'rows')])

    def ReportList(self, requestAPI: DistrictRequestAPI) -> Response:
        return self._Execute(requestAPI, DistrictAction.REPORT_LIST, "ReportList", "rows")

    def ReportTrend(self, requestAPI: DistrictRequestAPI) -> Response:
        return self._Execute(requestAPI, DistrictAction.REPORT_TREND, "ReportTrend", "rows")

    def OfficerCreate(self, requestAPI: DistrictOfficerCreateRequestAPI) -> Response:
        password = requestAPI.password
        if password is None:
            return self._Fail(400, "Password is required.")

        error = ValidateNewPassword(password)
        if error:
            return self._Fail(400, error)
        failure = self._VerifySignoff(requestAPI, "OfficerCreate")
        if failure is not None:
            return failure
        requestAPI.password_hash = HashPassword(password)     # BCrypt - plain password never reaches SQL
        return self._Execute(requestAPI, DistrictAction.OFFICER_CREATE, "OfficerCreate", "row")

    def FindPerson(self, requestAPI: DistrictRequestAPI) -> Response:
        # result sets: person (one row, or None when nothing matches) + recent (last searches of this officer)
        return self._Execute(requestAPI, DistrictAction.FIND_PERSON, "FindPerson", sets=[('person', 'row'), ('recent', 'rows')])
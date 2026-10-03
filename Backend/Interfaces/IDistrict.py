from abc import ABC, abstractmethod

from Models.RequestApiModels.DistrictRequestAPI import DistrictRequestAPI, DistrictDecisionRequestAPI
from Models.Response import Response


class IDistrict(ABC):
    @abstractmethod
    def Summary(self, requestAPI: DistrictRequestAPI) -> Response: ...

    @abstractmethod
    def List(self, requestAPI: DistrictRequestAPI) -> Response: ...

    @abstractmethod
    def Get(self, requestAPI: DistrictRequestAPI) -> Response: ...

    @abstractmethod
    def NicPendingList(self, requestAPI: DistrictRequestAPI) -> Response: ...

    @abstractmethod
    def Approve(self, requestAPI: DistrictDecisionRequestAPI) -> Response: ...

    @abstractmethod
    def Reject(self, requestAPI: DistrictDecisionRequestAPI) -> Response: ...

    @abstractmethod
    def ReportGenerate(self, requestAPI: DistrictRequestAPI) -> Response: ...

    @abstractmethod
    def ReportList(self, requestAPI: DistrictRequestAPI) -> Response: ...

    @abstractmethod
    def ReportTrend(self, requestAPI: DistrictRequestAPI) -> Response: ...

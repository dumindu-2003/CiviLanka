from abc import abstractmethod

from Interfaces.IApplication import IApplicationWithDashboard
from Models.RequestApiModels.ApplicationRequestAPI import ApplicationSaveRequestAPI
from Models.Response import Response


class IDeath(IApplicationWithDashboard):
    @abstractmethod
    def Decide(self, requestAPI: ApplicationSaveRequestAPI) -> Response: ...

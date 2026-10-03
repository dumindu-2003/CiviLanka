from abc import ABC, abstractmethod

from Models.RequestApiModels.ApplicationRequestAPI import ApplicationRequestAPI, ApplicationSaveRequestAPI
from Models.Response import Response


class IApplication(ABC):
    """Actions shared by sp_birth, sp_death, sp_marriage and sp_nic."""

    @abstractmethod
    def List(self, requestAPI: ApplicationRequestAPI) -> Response: ...

    @abstractmethod
    def Get(self, requestAPI: ApplicationRequestAPI) -> Response: ...

    @abstractmethod
    def Create(self, requestAPI: ApplicationSaveRequestAPI) -> Response: ...

    @abstractmethod
    def Update(self, requestAPI: ApplicationSaveRequestAPI) -> Response: ...

    @abstractmethod
    def Submit(self, requestAPI: ApplicationSaveRequestAPI) -> Response: ...

    @abstractmethod
    def Delete(self, requestAPI: ApplicationSaveRequestAPI) -> Response: ...


class IApplicationWithDashboard(IApplication):
    @abstractmethod
    def Dashboard(self, requestAPI: ApplicationRequestAPI) -> Response: ...

from abc import ABC, abstractmethod

from Models.RequestApiModels.CitizenRequestAPI import CitizenRequestAPI, CitizenSaveRequestAPI
from Models.Response import Response


class ICitizen(ABC):
    @abstractmethod
    def Search(self, requestAPI: CitizenRequestAPI) -> Response: ...

    @abstractmethod
    def Get(self, requestAPI: CitizenRequestAPI) -> Response: ...

    @abstractmethod
    def Create(self, requestAPI: CitizenSaveRequestAPI) -> Response: ...

    @abstractmethod
    def Update(self, requestAPI: CitizenSaveRequestAPI) -> Response: ...

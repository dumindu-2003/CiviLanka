from abc import ABC, abstractmethod

from Models.RequestApiModels.ProfileRequestAPI import ProfileRequestAPI
from Models.Response import Response


class IProfile(ABC):
    @abstractmethod
    def Get(self, requestAPI: ProfileRequestAPI) -> Response: ...

    @abstractmethod
    def UpdateContact(self, requestAPI: ProfileRequestAPI) -> Response: ...

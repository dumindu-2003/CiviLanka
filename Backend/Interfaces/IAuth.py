from abc import ABC, abstractmethod

from Models.RequestApiModels.UserRequestAPI import ChangePasswordRequestAPI, LoginRequestAPI
from Models.Response import Response
from Static.Security import CurrentOfficer


class IAuth(ABC):
    @abstractmethod
    def Login(self, requestAPI: LoginRequestAPI) -> Response: ...

    @abstractmethod
    def Access(self, officer: CurrentOfficer) -> Response: ...

    @abstractmethod
    def ChangePassword(self, requestAPI: ChangePasswordRequestAPI, officer: CurrentOfficer) -> Response: ...

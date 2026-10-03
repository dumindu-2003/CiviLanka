from abc import ABC, abstractmethod

from Models.RequestApiModels.AdminRequestAPI import AdminRequestAPI, AdminSetRequestAPI
from Models.Response import Response


class IAdmin(ABC):
    @abstractmethod
    def RoleList(self, requestAPI: AdminRequestAPI) -> Response: ...

    @abstractmethod
    def RoleCreate(self, requestAPI: AdminRequestAPI) -> Response: ...

    @abstractmethod
    def RoleUpdate(self, requestAPI: AdminRequestAPI) -> Response: ...

    @abstractmethod
    def RoleSetActive(self, requestAPI: AdminRequestAPI) -> Response: ...

    @abstractmethod
    def RoleDelete(self, requestAPI: AdminRequestAPI) -> Response: ...

    @abstractmethod
    def PermissionList(self, requestAPI: AdminRequestAPI) -> Response: ...

    @abstractmethod
    def RolePermissionList(self, requestAPI: AdminRequestAPI) -> Response: ...

    @abstractmethod
    def RolePermissionSet(self, requestAPI: AdminSetRequestAPI) -> Response: ...

    @abstractmethod
    def ScreenList(self, requestAPI: AdminRequestAPI) -> Response: ...

    @abstractmethod
    def RoleScreenList(self, requestAPI: AdminRequestAPI) -> Response: ...

    @abstractmethod
    def RoleScreenSet(self, requestAPI: AdminSetRequestAPI) -> Response: ...

    @abstractmethod
    def OfficerList(self, requestAPI: AdminRequestAPI) -> Response: ...

    @abstractmethod
    def OfficerCreate(self, requestAPI: AdminRequestAPI) -> Response: ...

    @abstractmethod
    def OfficerSetRole(self, requestAPI: AdminRequestAPI) -> Response: ...

    @abstractmethod
    def OfficerSetActive(self, requestAPI: AdminRequestAPI) -> Response: ...

    @abstractmethod
    def OfficerResetPassword(self, requestAPI: AdminRequestAPI) -> Response: ...

    @abstractmethod
    def Dashboard(self, requestAPI: AdminRequestAPI) -> Response: ...

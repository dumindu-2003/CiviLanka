from abc import ABC, abstractmethod

from Models.RequestApiModels.NotificationRequestAPI import NotificationRequestAPI
from Models.Response import Response


class INotification(ABC):
    @abstractmethod
    def List(self, requestAPI: NotificationRequestAPI) -> Response: ...

    @abstractmethod
    def UnreadCount(self, requestAPI: NotificationRequestAPI) -> Response: ...

    @abstractmethod
    def MarkRead(self, requestAPI: NotificationRequestAPI) -> Response: ...

    @abstractmethod
    def MarkAllRead(self, requestAPI: NotificationRequestAPI) -> Response: ...

    @abstractmethod
    def Delete(self, requestAPI: NotificationRequestAPI) -> Response: ...

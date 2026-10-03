from abc import ABC, abstractmethod

from Models.RequestApiModels.NewsRequestAPI import NewsRequestAPI
from Models.Response import Response


class INews(ABC):
    @abstractmethod
    def List(self, requestAPI: NewsRequestAPI) -> Response: ...

    @abstractmethod
    def Get(self, requestAPI: NewsRequestAPI) -> Response: ...

    @abstractmethod
    def Create(self, requestAPI: NewsRequestAPI) -> Response: ...

    @abstractmethod
    def Update(self, requestAPI: NewsRequestAPI) -> Response: ...

    @abstractmethod
    def Publish(self, requestAPI: NewsRequestAPI) -> Response: ...

    @abstractmethod
    def Unpublish(self, requestAPI: NewsRequestAPI) -> Response: ...

    @abstractmethod
    def Delete(self, requestAPI: NewsRequestAPI) -> Response: ...

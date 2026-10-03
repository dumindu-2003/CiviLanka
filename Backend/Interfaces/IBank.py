from abc import ABC, abstractmethod

from Models.RequestApiModels.BankRequestAPI import BankRequestAPI
from Models.Response import Response


class IBank(ABC):
    @abstractmethod
    def Verify(self, requestAPI: BankRequestAPI) -> Response: ...

    @abstractmethod
    def Recent(self, requestAPI: BankRequestAPI) -> Response: ...

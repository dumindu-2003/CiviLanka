from abc import ABC, abstractmethod

from Models.RequestApiModels.VillageRequestAPI import VillageRequestAPI
from Models.Response import Response


class IVillage(ABC):
    @abstractmethod
    def Dashboard(self, requestAPI: VillageRequestAPI) -> Response: ...

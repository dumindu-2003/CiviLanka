from abc import ABC, abstractmethod

from Models.RequestApiModels.AuditRequestAPI import AuditRequestAPI
from Models.Response import Response


class IAudit(ABC):
    @abstractmethod
    def List(self, requestAPI: AuditRequestAPI) -> Response: ...

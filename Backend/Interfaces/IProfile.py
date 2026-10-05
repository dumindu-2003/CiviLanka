from abc import ABC, abstractmethod

from Models.RequestApiModels.ProfileRequestAPI import ProfilePhotoRequestAPI, ProfileRequestAPI
from Models.Response import Response


class IProfile(ABC):
    @abstractmethod
    def Get(self, requestAPI: ProfileRequestAPI) -> Response: ...

    @abstractmethod
    def UpdateContact(self, requestAPI: ProfileRequestAPI) -> Response: ...

    @abstractmethod
    def PhotoUpload(self, requestAPI: ProfilePhotoRequestAPI, fileBytes: bytes) -> Response: ...

    @abstractmethod
    def PhotoGet(self, requestAPI: ProfilePhotoRequestAPI) -> Response: ...

    @abstractmethod
    def PhotoFile(self, requestAPI: ProfilePhotoRequestAPI) -> Response: ...

    @abstractmethod
    def PhotoDelete(self, requestAPI: ProfilePhotoRequestAPI) -> Response: ...
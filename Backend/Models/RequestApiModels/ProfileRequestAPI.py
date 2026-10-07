from typing import Optional

from Models.RequestApiModels.OfficerRequestAPI import OfficerRequestAPI


class ProfileRequestAPI(OfficerRequestAPI):
    officer_name: Optional[str] = None
    officer_phone: Optional[str] = None


class ProfilePhotoRequestAPI(OfficerRequestAPI):
    """Built by the API (never bound from the client): the file itself is not sent to SQL, only its details."""
    photo_id: Optional[int] = None
    original_file_name: Optional[str] = None
    content_type: Optional[str] = None
    file_size_bytes: Optional[int] = None
    file_ext: Optional[str] = None
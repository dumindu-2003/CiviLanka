from typing import Optional

from Models.RequestApiModels.OfficerRequestAPI import OfficerRequestAPI


class ProfileRequestAPI(OfficerRequestAPI):
    officer_name: Optional[str] = None
    officer_phone: Optional[str] = None

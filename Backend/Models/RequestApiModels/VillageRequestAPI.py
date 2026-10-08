from typing import Optional

from Models.RequestApiModels.OfficerRequestAPI import OfficerRequestAPI


class VillageRequestAPI(OfficerRequestAPI):
    category: Optional[str] = None

from datetime import date
from typing import Optional

from Models.RequestApiModels.OfficerRequestAPI import OfficerRequestAPI
from Models.RequestApiModels.SignoffRequestAPI import SignoffRequestAPI


class DistrictRequestAPI(OfficerRequestAPI):
    category: Optional[str] = None         # All | Birth | Death | Marriage | NIC
    app_ref: Optional[str] = None          # BRT-000012 ...
    reason: Optional[str] = None
    report_type: Optional[str] = None      # All | Birth | Death | Marriage | NIC
    from_date: Optional[date] = None
    to_date: Optional[date] = None


class DistrictDecisionRequestAPI(SignoffRequestAPI):
    """APPROVE / REJECT - needs the authorizing officer's credentials (verified with BCrypt by the API)."""
    app_ref: Optional[str] = None
    reason: Optional[str] = None           # required when rejecting

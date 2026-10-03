from typing import Any, Dict, Optional

from Models.RequestApiModels.OfficerRequestAPI import OfficerRequestAPI


class CitizenRequestAPI(OfficerRequestAPI):
    citizen_id: Optional[int] = None
    search_value: Optional[str] = None


class CitizenSaveRequestAPI(CitizenRequestAPI):
    """data = {"full_name","nic","date_of_birth","gender","phone","email","address"}"""
    data: Optional[Dict[str, Any]] = None

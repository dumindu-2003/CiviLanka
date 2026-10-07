from typing import Any, Dict, Optional

from Models.RequestApiModels.OfficerRequestAPI import OfficerRequestAPI
from Models.RequestApiModels.SignoffRequestAPI import SignoffRequestAPI


class ApplicationRequestAPI(OfficerRequestAPI):
    """sp_birth / sp_death / sp_marriage / sp_nic  - reads (Dashboard, List, Get)"""
    app_id: Optional[int] = None
    status: Optional[str] = None           # LIST filter: Draft | Pending | Approved | Rejected


class ApplicationSaveRequestAPI(SignoffRequestAPI):
    """Create / Update / Submit / Delete.
    status = 'Draft' | 'Pending' on Create ('Pending' and Submit need the sign-off officer's credentials).
    data keys = application column names, e.g. {"applicant_id":5,"baby_full_name":"..","date_of_birth":"2026-09-01"}"""
    app_id: Optional[int] = None
    status: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

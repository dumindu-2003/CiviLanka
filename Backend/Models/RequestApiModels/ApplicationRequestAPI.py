from typing import Any, Dict, Optional

from Models.RequestApiModels.OfficerRequestAPI import OfficerRequestAPI
from Models.RequestApiModels.SignoffRequestAPI import SignoffRequestAPI


class ApplicationRequestAPI(OfficerRequestAPI):
    """sp_birth / sp_death / sp_marriage / sp_nic  - reads (Dashboard, List, Get)"""
    app_id: Optional[int] = None
    status: Optional[str] = None           # LIST filter: Draft | Pending | Approved | Rejected


class ApplicationSaveRequestAPI(SignoffRequestAPI):
    """Create / Update / Submit / Delete.
    Application primary keys and audit columns are database-managed.
    Birth/death data keys are validated against their table columns by the matching data-access class."""
    app_id: Optional[int] = None
    status: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

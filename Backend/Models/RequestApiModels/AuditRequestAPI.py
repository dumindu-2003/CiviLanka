from datetime import date
from typing import Optional

from Models.RequestApiModels.OfficerRequestAPI import OfficerRequestAPI


class AuditRequestAPI(OfficerRequestAPI):
    from_date: Optional[date] = None
    to_date: Optional[date] = None
    table_name: Optional[str] = None
    user_id: Optional[int] = None

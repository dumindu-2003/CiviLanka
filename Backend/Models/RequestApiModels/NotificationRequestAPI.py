from typing import Optional

from Models.RequestApiModels.OfficerRequestAPI import OfficerRequestAPI


class NotificationRequestAPI(OfficerRequestAPI):
    notification_id: Optional[int] = None
    filter: Optional[str] = None      # All | Unread | Applications | System

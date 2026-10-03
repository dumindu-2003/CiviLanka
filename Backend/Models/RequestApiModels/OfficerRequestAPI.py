from typing import Optional

from Models.RequestAPI import RequestAPI


class OfficerRequestAPI(RequestAPI):
    """Base of every request that goes through usp_authorize. acting_officer_id is ALWAYS set from the JWT, never from the client."""
    acting_officer_id: Optional[int] = None

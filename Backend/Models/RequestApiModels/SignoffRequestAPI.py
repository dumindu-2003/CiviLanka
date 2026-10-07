from typing import ClassVar, Set

from typing import Optional

from Models.RequestApiModels.OfficerRequestAPI import OfficerRequestAPI


class SignoffRequestAPI(OfficerRequestAPI):
    """The authorizing (sign-off) officer proves who he/she is with username + service number + password.
    The API verifies it with BCrypt and puts the verified officer id in signoff_officer_id."""
    signoff_officer_id: Optional[int] = None          # always overwritten by the API
    signoff_username: Optional[str] = None
    signoff_service_number: Optional[str] = None
    signoff_password: Optional[str] = None

    DB_IGNORE: ClassVar[Set[str]] = {"signoff_username", "signoff_service_number", "signoff_password"}

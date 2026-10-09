from datetime import date
from typing import ClassVar, Optional, Set

from Models.RequestApiModels.OfficerRequestAPI import OfficerRequestAPI
from Models.RequestApiModels.SignoffRequestAPI import SignoffRequestAPI


class DistrictRequestAPI(OfficerRequestAPI):
    category: Optional[str] = None         # All | Birth | Death | Marriage | NIC
    app_ref: Optional[str] = None          # BRT-000012 ...
    reason: Optional[str] = None
    report_type: Optional[str] = None      # All | Birth | Death | Marriage | NIC
    from_date: Optional[date] = None
    to_date: Optional[date] = None
    search_value: Optional[str] = None     # FindPerson: NIC number or officer service number


class DistrictDecisionRequestAPI(SignoffRequestAPI):
    """APPROVE / REJECT - needs the authorizing officer's credentials (verified with BCrypt by the API)."""
    app_ref: Optional[str] = None
    reason: Optional[str] = None           # required when rejecting


class DistrictOfficerCreateRequestAPI(SignoffRequestAPI):
    """OFFICER_CREATE (Add Profile screen) - needs the authorizing officer's credentials, like Approve / Reject.
    role_name is the NAME of the role (e.g. "Village Officer"); the stored procedure looks the id up."""
    username: Optional[str] = None
    password: Optional[str] = None            # plain text from the client -> hashed into password_hash (BCrypt)
    password_hash: Optional[str] = None       # always overwritten by DADistrict
    service_number: Optional[str] = None
    role_name: Optional[str] = None
    officer_name: Optional[str] = None
    officer_phone: Optional[str] = None
    unit_name: Optional[str] = None           # district / division / department (goes to the role's profile table)
    nic: Optional[str] = None                 # NIC, date_of_birth, gender, email, address are stored in the citizens table
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

    DB_IGNORE: ClassVar[Set[str]] = {"signoff_username", "signoff_service_number", "signoff_password", "password"}
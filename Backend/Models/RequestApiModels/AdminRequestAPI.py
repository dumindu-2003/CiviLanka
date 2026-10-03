from typing import ClassVar, List, Optional, Set, Union

from Models.RequestApiModels.OfficerRequestAPI import OfficerRequestAPI


class AdminRequestAPI(OfficerRequestAPI):
    role_id: Optional[int] = None
    role_code: Optional[str] = None
    role_name: Optional[str] = None
    description: Optional[str] = None
    home_screen_key: Optional[str] = None
    officer_id: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None            # plain text from the client -> hashed into password_hash
    password_hash: Optional[str] = None       # always overwritten by DAAdmin
    service_number: Optional[str] = None
    officer_name: Optional[str] = None
    officer_phone: Optional[str] = None
    unit_name: Optional[str] = None
    sub_area: Optional[str] = None
    branch_name: Optional[str] = None
    is_active: Optional[bool] = None

    DB_IGNORE: ClassVar[Set[str]] = {"password"}


class AdminSetRequestAPI(AdminRequestAPI):
    """ROLE_PERMISSION_SET -> [1,2,3]    ROLE_SCREEN_SET -> ["Reports","AuditTrail"]"""
    json_ids: Optional[List[Union[int, str]]] = None

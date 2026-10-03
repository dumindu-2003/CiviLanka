from typing import Optional

from pydantic import BaseModel

from Models.RequestAPI import RequestAPI


class UserRequestAPI(RequestAPI):
    """Parameters of sp_auth (built by the data access layer, never bound from the client)."""
    p_username: Optional[str] = None
    p_service_number: Optional[str] = None
    p_officer_id: Optional[int] = None
    new_password_hash: Optional[str] = None


class LoginRequestAPI(BaseModel):
    username: str
    service_number: str
    password: str          # checked with BCrypt in Python - never sent to SQL


class ChangePasswordRequestAPI(BaseModel):
    current_password: str
    new_password: str

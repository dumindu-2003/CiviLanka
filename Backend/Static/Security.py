"""BCrypt password hashing + JWT bearer token (the officer id sent to every stored procedure comes from the token)."""
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

import AppSettings

_bearer = HTTPBearer(auto_error=False)


class CurrentOfficer(BaseModel):
    officer_id: int
    username: str
    service_number: str
    role_code: str


def ValidateNewPassword(password: Optional[str]) -> Optional[str]:
    """Returns an error message, or None when the password is acceptable."""
    if not password or len(password) < 8:
        return "Password must be at least 8 characters."
    if len(password.encode("utf-8")) > 72:
        return "Password is too long (BCrypt limit is 72 bytes)."
    return None


def HashPassword(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=11)).decode("utf-8")


def VerifyPassword(password: str, passwordHash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), passwordHash.encode("utf-8"))
    except ValueError:
        return False


def CreateToken(officerId: int, username: str, serviceNumber: str, roleCode: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(officerId),
        "username": username,
        "service_number": serviceNumber,
        "role_code": roleCode,
        "iat": now,
        "exp": now + timedelta(minutes=AppSettings.JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, AppSettings.JWT_SECRET, algorithm=AppSettings.JWT_ALGORITHM)


def GetCurrentOfficer(credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer)) -> CurrentOfficer:
    """[Authorize] attribute equivalent - use as Depends(GetCurrentOfficer)."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authentication required.")
    try:
        data = jwt.decode(credentials.credentials, AppSettings.JWT_SECRET, algorithms=[AppSettings.JWT_ALGORITHM])
        return CurrentOfficer(
            officer_id=int(data["sub"]),
            username=data.get("username", ""),
            service_number=data.get("service_number", ""),
            role_code=data.get("role_code", ""),
        )
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

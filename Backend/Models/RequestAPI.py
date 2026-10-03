from typing import ClassVar, Optional, Set

from pydantic import BaseModel


class RequestAPI(BaseModel):
    ActionType: Optional[str] = None

    # Fields that are read by the API but must NOT be sent to the stored procedure
    # (e.g. plain passwords, sign-off credentials).
    DB_IGNORE: ClassVar[Set[str]] = set()

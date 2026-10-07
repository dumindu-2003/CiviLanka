from typing import Any, Optional

from pydantic import BaseModel


class Response(BaseModel):
    StatusCode: int = 404
    Result: Optional[str] = None
    ResultSet: Optional[Any] = None

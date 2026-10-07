from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class ProcedureDBModel:
    ResultStatusCode: Optional[str] = None
    Result: Optional[str] = None
    ExceptionMessage: Optional[str] = None
    ResultDataTable: List[Dict[str, Any]] = field(default_factory=list)          # first result set
    ResultDataSet: List[List[Dict[str, Any]]] = field(default_factory=list)      # every result set (some SPs return 2-3)
    ErrorCode: int = 500                                                          # HTTP-style code mapped from the SQL THROW number

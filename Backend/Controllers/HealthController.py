from datetime import datetime, timezone

from fastapi import APIRouter

import AppSettings
from DataBaseConnectivity.DBConnect import DBconnect
from Models.Response import Response

router = APIRouter(prefix="/api/health", tags=["Health"])


@router.get("", response_model=Response)
def Health():
    return Response(
        StatusCode=200,
        Result="OK",
        ResultSet={
            "api": "ok",
            "database": AppSettings.DB_NAME,
            "server": AppSettings.DB_SERVER,
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        },
    )


@router.get("/database", response_model=Response)
def DatabaseHealth():
    try:
        rows = DBconnect().ReadTable("SELECT DB_NAME() AS database_name, @@SERVERNAME AS server_name")
        return Response(
            StatusCode=200,
            Result="Database connection OK",
            ResultSet={
                "database": rows[0]["database_name"] if rows else AppSettings.DB_NAME,
                "server": rows[0]["server_name"] if rows else AppSettings.DB_SERVER,
            },
        )
    except Exception as exc:
        return Response(StatusCode=500, Result=f"Database connection failed: {exc}", ResultSet=None)

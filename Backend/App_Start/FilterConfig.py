from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import AppSettings
from Models.Response import Response
from Static.LogHandler import LogHandler


def RegisterGlobalFilters(app: FastAPI):
    """HandleErrorAttribute equivalent: every error leaves the API as {StatusCode, Result, ResultSet}."""

    app.add_middleware(CORSMiddleware, allow_origins=AppSettings.CORS_ORIGINS, allow_methods=["*"], allow_headers=["*"])

    @app.exception_handler(HTTPException)
    async def _http_error(request: Request, exc: HTTPException):
        body = Response(StatusCode=exc.status_code, Result=str(exc.detail))
        return JSONResponse(status_code=exc.status_code, content=body.model_dump())

    @app.exception_handler(RequestValidationError)
    async def _validation_error(request: Request, exc: RequestValidationError):
        detail = "; ".join(f"{'.'.join(str(p) for p in e['loc'])}: {e['msg']}" for e in exc.errors())
        body = Response(StatusCode=400, Result=detail)
        return JSONResponse(status_code=400, content=body.model_dump())

    @app.exception_handler(Exception)
    async def _unhandled_error(request: Request, exc: Exception):
        LogHandler.WriteToLog(repr(exc), request.url.path)
        body = Response(StatusCode=500, Result="Internal server error.")
        return JSONResponse(status_code=500, content=body.model_dump())

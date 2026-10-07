"""Global.asax.cs equivalent.   Run:  uvicorn main:app --reload"""
from fastapi import FastAPI

from App_Start import FilterConfig, RouteConfig, UnityConfig

app = FastAPI(title="GovernReg API", description="Civil Registration Tracker - FastAPI + SQL Server stored procedures")


def Application_Start():
    FilterConfig.RegisterGlobalFilters(app)
    RouteConfig.RegisterRoutes(app)
    UnityConfig.RegisterComponents()


Application_Start()

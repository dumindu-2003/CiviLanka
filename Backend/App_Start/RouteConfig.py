from fastapi import FastAPI

from Controllers import (AdminController, AuditController, AuthController, BankController, BirthController,
                         CitizenController, DeathController, DistrictController, HealthController, HomeController,
                         MarriageController, NewsController, NicController, NotificationController, ProfileController,
                         VillageController)


def RegisterRoutes(app: FastAPI):
    # url: /api/{controller}/{action}   (e.g. /api/birth/Create)
    for controller in (HomeController, HealthController, AuthController, AdminController, NewsController, NotificationController,
                       AuditController, ProfileController, CitizenController, DistrictController, BirthController,
                       DeathController, MarriageController, NicController, VillageController, BankController):
        app.include_router(controller.router)

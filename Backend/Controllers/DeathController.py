from Controllers.ApplicationControllerBase import BuildApplicationRouter
from Interfaces.IDeath import IDeath

router = BuildApplicationRouter("/api/death", "Death", IDeath, True)

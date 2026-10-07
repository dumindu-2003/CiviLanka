from Controllers.ApplicationControllerBase import BuildApplicationRouter
from Interfaces.INic import INic

router = BuildApplicationRouter("/api/nic", "Nic", INic, False)

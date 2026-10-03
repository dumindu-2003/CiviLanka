from Controllers.ApplicationControllerBase import BuildApplicationRouter
from Interfaces.IBirth import IBirth

router = BuildApplicationRouter("/api/birth", "Birth", IBirth, True)

from Controllers.ApplicationControllerBase import BuildApplicationRouter
from Interfaces.IMarriage import IMarriage

router = BuildApplicationRouter("/api/marriage", "Marriage", IMarriage, True)

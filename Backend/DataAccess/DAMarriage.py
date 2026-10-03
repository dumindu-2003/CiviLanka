from DataAccess.DAApplication import DAApplication
from Interfaces.IMarriage import IMarriage


class DAMarriage(DAApplication, IMarriage):
    ProcedureName = "sp_marriage"

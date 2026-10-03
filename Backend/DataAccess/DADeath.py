from DataAccess.DAApplication import DAApplication
from Interfaces.IDeath import IDeath


class DADeath(DAApplication, IDeath):
    ProcedureName = "sp_death"

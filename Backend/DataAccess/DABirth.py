from DataAccess.DAApplication import DAApplication
from Interfaces.IBirth import IBirth


class DABirth(DAApplication, IBirth):
    ProcedureName = "sp_birth"

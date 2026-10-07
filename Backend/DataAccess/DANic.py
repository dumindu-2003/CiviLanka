from DataAccess.DAApplication import DAApplication
from Interfaces.INic import INic


class DANic(DAApplication, INic):
    ProcedureName = "sp_nic"

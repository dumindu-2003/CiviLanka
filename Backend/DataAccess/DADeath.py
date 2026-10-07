from DataAccess.DAApplication import DAApplication
from Interfaces.IDeath import IDeath


class DADeath(DAApplication, IDeath):
    ProcedureName = "sp_death"
    AllowStatusUpdate = False
    AllowedDataFields = {
        "deceased_name",
        "deceased_nic",
        "date_of_birth",
        "date_of_death",
        "time_of_death",
        "place_of_death",
        "gender",
        "age_at_death",
        "cause_of_death",
        "marital_status",
        "permanent_address",
        "informant_name",
        "informant_nic",
        "informant_relationship",
        "informant_contact",
    }

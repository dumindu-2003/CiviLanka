from DataAccess.DAApplication import DAApplication
from Interfaces.IBirth import IBirth


class DABirth(DAApplication, IBirth):
    ProcedureName = "sp_birth"
    AllowStatusUpdate = False
    AllowedDataFields = {
        "baby_full_name",
        "date_of_birth",
        "time_of_birth",
        "place_of_birth",
        "gender",
        "birth_weight",
        "father_name",
        "father_nic",
        "father_occupation",
        "father_address",
        "mother_name",
        "mother_nic",
        "mother_occupation",
        "mother_address",
        "hospital_name",
        "registration_date",
    }

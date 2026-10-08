from DataAccess.DAApplication import DAApplication
from Interfaces.INic import INic


class DANic(DAApplication, INic):
    ProcedureName = "sp_nic"
    AllowStatusUpdate = False
    # Keys match the village NIC form. applicant_id is citizens.citizen_id.
    # spouse_name is an existing column and is not on the form; it stays accepted.
    AllowedDataFields = {
        "applicant_id",
        "full_name",
        "date_of_birth",
        "gender",
        "place_of_birth",
        "district",
        "religion",
        "occupation",
        "permanent_address",
        "current_address",
        "same_as_permanent",
        "phone",
        "email",
        "father_name",
        "father_nic",
        "mother_name",
        "mother_nic",
        "marital_status",
        "spouse_name",
        "nic_type",
        "documents",
    }

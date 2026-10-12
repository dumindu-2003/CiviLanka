from DataAccess.DAApplication import DAApplication
from Interfaces.IDeath import IDeath
from Models.RequestApiModels.ApplicationRequestAPI import ApplicationSaveRequestAPI
from Models.Response import Response
from Static.ActionTypes import ApplicationAction


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

    def Decide(self, requestAPI: ApplicationSaveRequestAPI) -> Response:
        if not requestAPI.app_id or requestAPI.app_id <= 0:
            return self._Fail(400, "A positive application ID is required.")
        if requestAPI.status not in {"Approved", "Rejected"}:
            return self._Fail(400, "Decision must be Approved or Rejected.")
        reason = ""
        if isinstance(requestAPI.data, dict):
            reason = str(requestAPI.data.get("reason") or "").strip()
        if requestAPI.status == "Rejected" and not reason:
            return self._Fail(400, "A rejection reason is required.")
        if requestAPI.status == "Rejected" and len(reason) > 250:
            return self._Fail(400, "The rejection reason must be 250 characters or fewer.")
        requestAPI.signoff_officer_id = None
        return self._Execute(requestAPI, ApplicationAction.DECIDE, "Decide", "row")

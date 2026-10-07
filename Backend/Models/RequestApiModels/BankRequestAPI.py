from typing import Optional

from Models.RequestApiModels.OfficerRequestAPI import OfficerRequestAPI


class BankRequestAPI(OfficerRequestAPI):
    search_value: Optional[str] = None     # NIC number or application reference

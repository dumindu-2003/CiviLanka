from typing import Optional

from Models.RequestApiModels.OfficerRequestAPI import OfficerRequestAPI


class NewsRequestAPI(OfficerRequestAPI):
    news_id: Optional[int] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    is_important: Optional[bool] = None
    publish: Optional[bool] = None
    include_unpublished: Optional[bool] = None

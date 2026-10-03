from Interfaces.INews import INews
from DataAccess.DABase import DABase
from Models.RequestApiModels.NewsRequestAPI import NewsRequestAPI
from Models.Response import Response
from Static.ActionTypes import NewsAction



class DANews(DABase, INews):
    ProcedureName = "sp_news"

    def List(self, requestAPI: NewsRequestAPI) -> Response:
        return self._Execute(requestAPI, NewsAction.LIST, "List", "rows")

    def Get(self, requestAPI: NewsRequestAPI) -> Response:
        return self._Execute(requestAPI, NewsAction.GET, "Get", "row")

    def Create(self, requestAPI: NewsRequestAPI) -> Response:
        return self._Execute(requestAPI, NewsAction.CREATE, "Create", "row")

    def Update(self, requestAPI: NewsRequestAPI) -> Response:
        return self._Execute(requestAPI, NewsAction.UPDATE, "Update", "row")

    def Publish(self, requestAPI: NewsRequestAPI) -> Response:
        return self._Execute(requestAPI, NewsAction.PUBLISH, "Publish", "row")

    def Unpublish(self, requestAPI: NewsRequestAPI) -> Response:
        return self._Execute(requestAPI, NewsAction.UNPUBLISH, "Unpublish", "row")

    def Delete(self, requestAPI: NewsRequestAPI) -> Response:
        return self._Execute(requestAPI, NewsAction.DELETE, "Delete", "row")

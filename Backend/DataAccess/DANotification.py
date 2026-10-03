from Interfaces.INotification import INotification
from DataAccess.DABase import DABase
from Models.RequestApiModels.NotificationRequestAPI import NotificationRequestAPI
from Models.Response import Response
from Static.ActionTypes import NotificationAction



class DANotification(DABase, INotification):
    ProcedureName = "sp_notification"

    def List(self, requestAPI: NotificationRequestAPI) -> Response:
        return self._Execute(requestAPI, NotificationAction.LIST, "List", "rows")

    def UnreadCount(self, requestAPI: NotificationRequestAPI) -> Response:
        return self._Execute(requestAPI, NotificationAction.UNREAD_COUNT, "UnreadCount", "row")

    def MarkRead(self, requestAPI: NotificationRequestAPI) -> Response:
        return self._Execute(requestAPI, NotificationAction.MARK_READ, "MarkRead", "row")

    def MarkAllRead(self, requestAPI: NotificationRequestAPI) -> Response:
        return self._Execute(requestAPI, NotificationAction.MARK_ALL_READ, "MarkAllRead", "row")

    def Delete(self, requestAPI: NotificationRequestAPI) -> Response:
        return self._Execute(requestAPI, NotificationAction.DELETE, "Delete", "row")

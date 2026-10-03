from Interfaces.IAdmin import IAdmin
from DataAccess.DABase import DABase
from Models.RequestApiModels.AdminRequestAPI import AdminRequestAPI, AdminSetRequestAPI
from Models.Response import Response
from Static.ActionTypes import AdminAction
from Static.Security import HashPassword, ValidateNewPassword


class DAAdmin(DABase, IAdmin):
    ProcedureName = "sp_admin"

    def RoleList(self, requestAPI: AdminRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.ROLE_LIST, "RoleList", "rows")

    def RoleCreate(self, requestAPI: AdminRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.ROLE_CREATE, "RoleCreate", "row")

    def RoleUpdate(self, requestAPI: AdminRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.ROLE_UPDATE, "RoleUpdate", "row")

    def RoleSetActive(self, requestAPI: AdminRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.ROLE_SET_ACTIVE, "RoleSetActive", "row")

    def RoleDelete(self, requestAPI: AdminRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.ROLE_DELETE, "RoleDelete", "row")

    def PermissionList(self, requestAPI: AdminRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.PERMISSION_LIST, "PermissionList", "rows")

    def RolePermissionList(self, requestAPI: AdminRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.ROLE_PERMISSION_LIST, "RolePermissionList", "rows")

    def RolePermissionSet(self, requestAPI: AdminSetRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.ROLE_PERMISSION_SET, "RolePermissionSet", "row")

    def ScreenList(self, requestAPI: AdminRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.SCREEN_LIST, "ScreenList", "rows")

    def RoleScreenList(self, requestAPI: AdminRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.ROLE_SCREEN_LIST, "RoleScreenList", "rows")

    def RoleScreenSet(self, requestAPI: AdminSetRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.ROLE_SCREEN_SET, "RoleScreenSet", "row")

    def OfficerList(self, requestAPI: AdminRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.OFFICER_LIST, "OfficerList", "rows")

    def OfficerCreate(self, requestAPI: AdminRequestAPI) -> Response:
        error = ValidateNewPassword(requestAPI.password)
        if error:
            return self._Fail(400, error)
        requestAPI.password_hash = HashPassword(requestAPI.password)     # BCrypt - plain password never reaches SQL
        return self._Execute(requestAPI, AdminAction.OFFICER_CREATE, "OfficerCreate", "row")

    def OfficerSetRole(self, requestAPI: AdminRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.OFFICER_SET_ROLE, "OfficerSetRole", "row")

    def OfficerSetActive(self, requestAPI: AdminRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.OFFICER_SET_ACTIVE, "OfficerSetActive", "row")

    def OfficerResetPassword(self, requestAPI: AdminRequestAPI) -> Response:
        error = ValidateNewPassword(requestAPI.password)
        if error:
            return self._Fail(400, error)
        requestAPI.password_hash = HashPassword(requestAPI.password)
        return self._Execute(requestAPI, AdminAction.OFFICER_RESET_PASSWORD, "OfficerResetPassword", "row")

    def Dashboard(self, requestAPI: AdminRequestAPI) -> Response:
        return self._Execute(requestAPI, AdminAction.DASHBOARD, "Dashboard", "row")

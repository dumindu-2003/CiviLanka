import { apiClient } from './apiClient';

// Administrator only. Permissions: ROLE_MANAGE, PERMISSION_ASSIGN, USER_MANAGE, DASHBOARD_ADMIN.

// ── DASHBOARD ──────────────────────────────────────────────────────────────
// GET /api/admin/Dashboard
export const getAdminDashboard = () =>
  apiClient.get<{
    officers: number;
    active_officers: number;
    roles: number;
    published_news: number;
    pending_applications: number;
  }>('/api/admin/Dashboard');

// ══════════════════════════════ ROLES ══════════════════════════════
export interface Role {
  role_id: number;
  role_code: string;
  role_name: string;
  description: string | null;
  is_system: boolean;
  is_active: boolean;
  home_screen: string | null;
  permission_count: number;
  officer_count: number;
}

// GET /api/admin/RoleList
export const getRoleList = () => apiClient.get<Role[]>('/api/admin/RoleList');

// POST /api/admin/RoleCreate      body: { role_code, role_name, description?, home_screen_key? }
export const createRole = (r: { role_code: string; role_name: string; description?: string; home_screen_key?: string }) =>
  apiClient.post<{ role_id: number }>('/api/admin/RoleCreate', r);

// POST /api/admin/RoleUpdate      body: { role_id, role_name?, description?, home_screen_key? }
export const updateRole = (roleId: number, r: { role_name?: string; description?: string; home_screen_key?: string }) =>
  apiClient.post<{ role_id: number }>('/api/admin/RoleUpdate', { role_id: roleId, ...r });

// POST /api/admin/RoleSetActive   body: { role_id, is_active }
export const setRoleActive = (roleId: number, isActive: boolean) =>
  apiClient.post<{ role_id: number }>('/api/admin/RoleSetActive', { role_id: roleId, is_active: isActive });

// POST /api/admin/RoleDelete      body: { role_id }
export const deleteRole = (roleId: number) => apiClient.post<{ role_id: number }>('/api/admin/RoleDelete', { role_id: roleId });

// ══════════════════════════════ SCREENS (which app screens a role can open) ══════════════════════════════
export interface Screen {
  screen_id: number;
  screen_key: string;
  screen_title: string;
  screen_type: string;
}

// GET /api/admin/ScreenList
export const getScreenList = () => apiClient.get<Screen[]>('/api/admin/ScreenList');

// GET /api/admin/RoleScreenList?role_id=2        every screen + allowed true/false for that role
export const getRoleScreens = (roleId: number) =>
  apiClient.get<(Screen & { allowed: boolean })[]>('/api/admin/RoleScreenList', { role_id: roleId });

// POST /api/admin/RoleScreenSet   body: { role_id, json_ids: ['Reports','AuditTrail'] }   (replaces the whole list)
export const setRoleScreens = (roleId: number, screenKeys: string[]) =>
  apiClient.post<{ role_id: number }>('/api/admin/RoleScreenSet', { role_id: roleId, json_ids: screenKeys });

// ══════════════════════════════ PERMISSIONS ══════════════════════════════
export interface Permission {
  permission_id: number;
  permission_code: string;
  module: string;
  description: string | null;
}

// GET /api/admin/PermissionList
export const getPermissionList = () => apiClient.get<Permission[]>('/api/admin/PermissionList');

// GET /api/admin/RolePermissionList?role_id=2    every permission + granted true/false for that role
export const getRolePermissions = (roleId: number) =>
  apiClient.get<(Permission & { granted: boolean })[]>('/api/admin/RolePermissionList', { role_id: roleId });

// POST /api/admin/RolePermissionSet   body: { role_id, json_ids: [1,2,3] }   (replaces the whole list)
export const setRolePermissions = (roleId: number, permissionIds: number[]) =>
  apiClient.post<{ role_id: number }>('/api/admin/RolePermissionSet', { role_id: roleId, json_ids: permissionIds });

// ══════════════════════════════ OFFICERS ══════════════════════════════
export interface OfficerRow {
  officer_id: number;
  username: string;
  service_number: string;
  officer_name: string | null;
  officer_phone: string | null;
  unit_name: string | null;
  role_id: number;
  role_code: string;
  role_name: string;
  is_active: boolean;
  last_login_at: string | null;
}

// GET /api/admin/OfficerList            (?role_id=2 to filter)
export const getOfficerList = (roleId?: number) => apiClient.get<OfficerRow[]>('/api/admin/OfficerList', { role_id: roleId });

// AddProfileScreen (5-step officer enrollment) -> last step "Authorize & Submit"
// POST /api/admin/OfficerCreate
// Form field            -> request field
//   fullName            -> officer_name
//   cadreNo             -> service_number
//   password            -> password          (plain text, the API hashes it, min 8 chars)
//   phone               -> officer_phone
//   district / department / workAddress -> unit_name   (pick one)
//   role (name)         -> role_id           (look the id up in getRoleList())
//   username            -> username          (the form has NO username field - use govEmail or cadreNo)
export const createOfficer = (o: {
  username: string;
  password: string;
  service_number: string;
  role_id: number;
  officer_name: string;
  officer_phone?: string;
  unit_name?: string;
  sub_area?: string; // village officer: service area numbers
  branch_name?: string; // bank officer
}) => apiClient.post<{ officer_id: number }>('/api/admin/OfficerCreate', o);

// POST /api/admin/OfficerSetRole        body: { officer_id, role_id }
export const setOfficerRole = (officerId: number, roleId: number) =>
  apiClient.post<{ officer_id: number }>('/api/admin/OfficerSetRole', { officer_id: officerId, role_id: roleId });

// POST /api/admin/OfficerSetActive      body: { officer_id, is_active }
export const setOfficerActive = (officerId: number, isActive: boolean) =>
  apiClient.post<{ officer_id: number }>('/api/admin/OfficerSetActive', { officer_id: officerId, is_active: isActive });

// POST /api/admin/OfficerResetPassword  body: { officer_id, password }
export const resetOfficerPassword = (officerId: number, newPassword: string) =>
  apiClient.post<{ officer_id: number }>('/api/admin/OfficerResetPassword', { officer_id: officerId, password: newPassword });
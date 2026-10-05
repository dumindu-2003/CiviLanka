import { apiClient } from './apiClient';
import { DEMO_MODE } from '../config';
import { DEMO_LOGIN, wait } from './demoData';
import type { LoginPayload, LoginResult } from '../types/auth';

// Used by: LoginScreen (via actions/authAction.ts)

// ── SIGN IN ────────────────────────────────────────────────────────────────
// POST /api/auth/Login
// body     : { username, service_number, password }
// returns  : { token, officer{...}, home_screen, allowed_screens[], permissions[] }
// Mapped to the LoginResult shape the Redux auth slice already uses.
interface LoginResponse {
  token: string;
  officer: {
    officer_id: number;
    username: string;
    service_number: string;
    officer_name: string | null;
    unit_name: string | null;
    role_code: string;
    role_name: string;
    must_change_password: boolean;
  };
  home_screen: string;
  allowed_screens: string[];
  permissions: string[];
}

export const loginOfficer = async (p: LoginPayload): Promise<LoginResult> => {
  if (DEMO_MODE) {
    await wait();
    return DEMO_LOGIN;
  }
  const r = await apiClient.post<LoginResponse>('/api/auth/Login', {
    username: p.username,
    service_number: p.serviceNo,
    password: p.password,
  });
  return {
    token: r.token,
    user: {
      id: String(r.officer.officer_id),
      fullName: r.officer.officer_name ?? r.officer.username,
      serviceNo: r.officer.service_number,
      designation: r.officer.role_name,
      role: r.officer.role_code,
      officeLocation: r.officer.unit_name ?? undefined,
    },
    homeScreen: r.home_screen,
    allowedScreens: r.allowed_screens,
  };
};

// ── REFRESH SCREENS / PERMISSIONS ──────────────────────────────────────────
// GET /api/auth/Access        (needs token)
export const getAccess = () =>
  apiClient.get<{ role_code: string; home_screen: string; allowed_screens: string[]; permissions: string[] }>(
    '/api/auth/Access',
  );

// ── CHANGE PASSWORD ────────────────────────────────────────────────────────
// POST /api/auth/ChangePassword   (MyProfileScreen -> "Change Password")
// new password: min 8 characters
export const changePassword = (currentPassword: string, newPassword: string) =>
  apiClient.post<unknown>('/api/auth/ChangePassword', {
    current_password: currentPassword,
    new_password: newPassword,
  });
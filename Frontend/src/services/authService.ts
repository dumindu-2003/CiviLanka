import { apiClient } from './apiClient';
import { DEMO_MODE } from '../config';
import { DEMO_LOGIN, wait } from './demoData';
import type { LoginPayload, LoginResult } from '../types/auth';

// Used by: LoginScreen (via actions/authAction.ts)

const VILLAGE_HOME = 'VillageDashboard';

const VILLAGE_FORM_SCREENS = [
  'NicPersonalDetails',
  'NicContactFamily',
  'NicDocuments',
  'NicDeclaration',
  'NicReceipt',
  'CertificatePreview',
  'CertificateDetail',
];

const VILLAGE_DEMO: LoginResult = {
  token: 'demo-token-village',
  user: {
    id: '2',
    fullName: 'K. M. Bandara',
    serviceNo: 'VO-2024-8841',
    designation: 'Village Officer',
    role: 'VILLAGE_OFFICER',
    department: 'Grama Niladhari',
    officeLocation: 'Colombo',
  },
  homeScreen: VILLAGE_HOME,
  allowedScreens: VILLAGE_FORM_SCREENS,
};

function looksLikeVillage(value: string) {
  return /village|grama|niladhari/.test(value.toLowerCase()) || /\bvo\b/i.test(value);
}

function homeForOfficer(homeScreen: string, role: string, designation: string) {
  if (homeScreen === VILLAGE_HOME || looksLikeVillage(`${role} ${designation} ${homeScreen}`)) return VILLAGE_HOME;
  return homeScreen;
}

function screensFor(homeScreen: string, screens: string[]) {
  if (homeScreen !== VILLAGE_HOME) return screens;
  const next = [...screens];
  for (const key of VILLAGE_FORM_SCREENS) {
    if (!next.includes(key)) next.push(key);
  }
  return next;
}

function isVillageLogin(p: LoginPayload) {
  return looksLikeVillage(`${p.username} ${p.serviceNo}`);
}

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
    return isVillageLogin(p) ? VILLAGE_DEMO : DEMO_LOGIN;
  }
  const r = await apiClient.post<LoginResponse>('/api/auth/Login', {
    username: p.username,
    service_number: p.serviceNo,
    password: p.password,
  });
  const role = r.officer.role_code;
  const designation = r.officer.role_name;
  const homeScreen = homeForOfficer(r.home_screen, role, designation);
  return {
    token: r.token,
    user: {
      id: String(r.officer.officer_id),
      fullName: r.officer.officer_name ?? r.officer.username,
      serviceNo: r.officer.service_number,
      designation,
      role,
      officeLocation: r.officer.unit_name ?? undefined,
    },
    homeScreen,
    allowedScreens: screensFor(homeScreen, r.allowed_screens),
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

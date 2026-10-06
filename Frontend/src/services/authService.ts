import { http } from './apiClient';
import { DEMO_MODE } from '../config';
import type { AuthUser, LoginPayload, LoginResult } from '../types/auth';

const VILLAGE_HOME = 'VillageDashboard';

const DEMO_RESULT: LoginResult = {
  token: 'demo-token',
  user: {
    id: '1',
    fullName: 'Saman Perera',
    serviceNo: 'DR-001',
    designation: 'District Registrar',
    role: 'DISTRICT_REGISTRAR',
    nic: '199012345678',
    dateOfBirth: '1990-05-15',
    gender: 'Male',
    email: 'saman.perera@gov.lk',
    phone: '+94 77 123 4567',
    address: 'No. 45, Main Street, Colombo',
    employeeId: 'EMP-2024-001',
    department: 'Divisional Secretariat',
    officeLocation: 'Kaduwela',
  },
  homeScreen: 'DistrictDashboard',
  allowedScreens: ['Reports', 'NicPendingList', 'NicApplicationReview', 'AddProfile'],
};

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
  allowedScreens: ['NicPersonalDetails', 'NicContactFamily', 'NicDocuments', 'NicDeclaration', 'NicReceipt'],
};

function looksLikeVillage(value: string) {
  return /village|grama|niladhari/.test(value.toLowerCase()) || /\bvo\b/i.test(value);
}

function homeForOfficer(homeScreen: string, role: string, designation: string) {
  if (homeScreen === VILLAGE_HOME || looksLikeVillage(`${role} ${designation} ${homeScreen}`)) return VILLAGE_HOME;
  return homeScreen;
}

const VILLAGE_FORM_SCREENS = ['NicPersonalDetails', 'NicContactFamily', 'NicDocuments', 'NicDeclaration', 'NicReceipt'];

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

function toLoginResult(raw: any): LoginResult {
  const officer = raw?.officer ?? raw?.user ?? {};
  const role = String(officer.role_code ?? officer.role ?? '');
  const designation = String(officer.role_name ?? officer.designation ?? '');
  const user: AuthUser = {
    id: String(officer.officer_id ?? officer.id ?? ''),
    fullName: officer.officer_name ?? officer.fullName ?? '',
    serviceNo: officer.service_number ?? officer.serviceNo ?? '',
    designation: designation || 'Officer',
    role,
    email: officer.email,
    phone: officer.phone,
    department: officer.unit_name ?? officer.department,
  };
  return {
    token: raw?.token ?? '',
    user,
    homeScreen: homeForOfficer(String(raw?.homeScreen ?? raw?.home_screen ?? ''), role, designation),
    allowedScreens: screensFor(
      homeForOfficer(String(raw?.homeScreen ?? raw?.home_screen ?? ''), role, designation),
      raw?.allowedScreens ?? raw?.allowed_screens ?? [],
    ),
  };
}

export const authService = {
  login: async (p: LoginPayload): Promise<LoginResult> => {
    if (DEMO_MODE) return isVillageLogin(p) ? VILLAGE_DEMO : DEMO_RESULT;

    const res = await http.post('/api/auth/Login', {
      username: p.username,
      service_number: p.serviceNo,
      password: p.password,
    });
    const body = res.data ?? {};
    if (typeof body.StatusCode === 'number' && body.StatusCode !== 200) {
      throw new Error(body.Result || 'Login failed');
    }
    if (body.success === false) throw new Error(body.message || 'Login failed');
    return toLoginResult(body.ResultSet ?? body.data ?? body);
  },
};
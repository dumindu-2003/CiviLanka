import { callAction } from './apiClient';
import { DEMO_MODE } from '../config';
import type { LoginPayload, LoginResult } from '../types/auth';

const ROUTE = 'auth';
const ACTION = { LOGIN: 'LOGIN' } as const;

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

export const authService = {
  login: async (p: LoginPayload): Promise<LoginResult> => {
    if (DEMO_MODE) return DEMO_RESULT;
    return callAction<LoginResult>(ROUTE, ACTION.LOGIN, p);
  },
};
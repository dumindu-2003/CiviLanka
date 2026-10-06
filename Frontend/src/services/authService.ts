import { requestApi } from './apiClient';
import { DEMO_MODE } from '../config';
import type { LoginPayload, LoginResult } from '../types/auth';

const ROUTE = 'auth';

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
    const result = await requestApi<{
      token: string;
      officer: {
        officer_id: number;
        username: string;
        service_number: string;
        officer_name: string;
        role_code: string;
        role_name: string;
      };
      home_screen: string;
      allowed_screens: string[];
    }>(`${ROUTE}/Login`, 'POST', {
      username: p.username,
      service_number: p.serviceNo,
      password: p.password,
    });

    return {
      token: result.token,
      user: {
        id: String(result.officer.officer_id),
        fullName: result.officer.officer_name,
        serviceNo: result.officer.service_number,
        designation: result.officer.role_name,
        role: result.officer.role_code,
      },
      homeScreen: result.home_screen,
      allowedScreens: result.allowed_screens,
    };
  },
};
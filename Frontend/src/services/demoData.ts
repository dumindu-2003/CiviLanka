// Mock data used only when EXPO_PUBLIC_DEMO_MODE=1  (no backend needed)
import type { LoginResult } from '../types/auth';
import type { ApplicationItem, Decision, DashboardSummary } from '../types/district';

export const wait = (ms = 250) => new Promise<void>((r) => setTimeout(r, ms));

export const DEMO_LOGIN: LoginResult = {
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

const summary: DashboardSummary = { pending: 15, approved: 45, rejected: 3, totalRecords: 63 };

const apps: ApplicationItem[] = [
  { id: 'APP001', category: 'Birth', applicantName: 'Saman Perera', submittedOn: '2026-09-01', status: 'Pending' },
  { id: 'APP002', category: 'Death', applicantName: 'Nimal Silva', submittedOn: '2026-08-28', status: 'Pending' },
];

export const demoSummary = (): DashboardSummary => ({ ...summary });

export const demoQueue = (category: string): ApplicationItem[] =>
  apps.filter((a) => category === 'All' || a.category === category).map((a) => ({ ...a }));

export const demoDecide = (id: string, decision: Decision) => {
  const app = apps.find((a) => a.id === id);
  if (!app || app.status !== 'Pending') return;
  app.status = decision === 'APPROVE' ? 'Approved' : 'Rejected';
  summary.pending -= 1;
  if (decision === 'APPROVE') summary.approved += 1;
  else summary.rejected += 1;
};
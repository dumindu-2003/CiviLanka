import { apiClient, toSignoff } from './apiClient';
import { DEMO_MODE } from '../config';
import { demoDecide, demoQueue, demoSummary, wait } from './demoData';
import type { SignOffCredentials } from '../types/auth';
import type { Status } from '../components/StatusBadge';
import type { ApplicationItem, Category, DashboardSummary } from '../types/district';

// Needs permission APPLICATION_APPROVE (District Registrar). Reports need REPORT_VIEW / REPORT_GENERATE.

const pick = <T = any>(row: Record<string, any>, ...keys: string[]): T | undefined => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key] as T;
  }
  return undefined;
};

const toStatus = (value: any): Status => {
  const normalized = String(value ?? 'Pending').toLowerCase();
  if (normalized === 'approved') return 'Approved';
  if (normalized === 'rejected') return 'Rejected';
  return 'Pending';
};

const normalizeSummary = (row: Record<string, any>): DashboardSummary => ({
  pending: Number(pick(row, 'pending', 'Pending', 'pending_count') ?? 0),
  approved: Number(pick(row, 'approved', 'Approved', 'approved_count') ?? 0),
  rejected: Number(pick(row, 'rejected', 'Rejected', 'rejected_count') ?? 0),
  totalRecords: Number(pick(row, 'totalRecords', 'total_records', 'TotalRecords', 'total') ?? 0),
});

const normalizeQueueItem = (row: Record<string, any>): ApplicationItem => ({
  id: String(pick(row, 'id', 'app_ref', 'application_ref', 'applicationId', 'application_id') ?? ''),
  category: (pick(row, 'category', 'application_type', 'type') ?? 'Birth') as ApplicationItem['category'],
  applicantName: String(pick(row, 'applicantName', 'applicant_name', 'citizenName', 'full_name', 'name') ?? 'Unknown applicant'),
  submittedOn: String(pick(row, 'submittedOn', 'submitted_on', 'created_at', 'submitted_date') ?? ''),
  status: toStatus(pick(row, 'status', 'application_status')),
});

// ── DASHBOARD ──────────────────────────────────────────────────────────────
// DistrictDashboardScreen -> the 4 tiles
// GET /api/district/Summary
// returns : { pending, approved, rejected, totalRecords }
export const getDistrictSummary = async (): Promise<DashboardSummary> => {
  if (DEMO_MODE) {
    await wait();
    return demoSummary();
  }
  const row = await apiClient.get<Record<string, any>>('/api/district/Summary');
  return normalizeSummary(row ?? {});
};

// DistrictDashboardScreen -> category chips + application list (Birth / Death / Marriage; NIC is NOT in this list)
// GET /api/district/List?category=All|Birth|Death|Marriage
// returns : [{ id: 'BRT-000012', category, applicantName, submittedOn: 'yyyy-MM-dd', status }]
export const getDistrictQueue = async (category: Category): Promise<ApplicationItem[]> => {
  if (DEMO_MODE) {
    await wait();
    return demoQueue(category);
  }
  const rows = await apiClient.get<Record<string, any>[]>('/api/district/List', { category });
  return (rows ?? []).map(normalizeQueueItem).filter((item) => item.id);
};

// ── ONE APPLICATION (any type) ─────────────────────────────────────────────
// NicApplicationReviewScreen -> detail card
// GET /api/district/Get?app_ref=NIC-000012      (BRT- / DTH- / MRG- / NIC-)
// returns : the full application row (nic_application: full_name, date_of_birth, phone, permanent_address, ...)
export const getApplicationDetail = (appRef: string) =>
  apiClient.get<Record<string, any>>('/api/district/Get', { app_ref: appRef });

// ── NIC PENDING LIST ───────────────────────────────────────────────────────
// NicPendingListScreen
// GET /api/district/NicPendingList
// returns : [{ id: 'NIC-000012', applicantName, submittedOn, status, submittedBy }]
export interface NicPendingItem {
  id: string;
  applicantName: string;
  submittedOn: string;
  status: string;
  submittedBy: string | null; // village officer name
  division?: string;
  place?: string;
  type?: string;
}
const normalizeNicPendingItem = (row: Record<string, any>): NicPendingItem => ({
  id: String(pick(row, 'id', 'app_ref', 'application_ref', 'applicationId', 'application_id') ?? ''),
  applicantName: String(pick(row, 'applicantName', 'applicant_name', 'citizenName', 'full_name', 'name') ?? 'Unknown applicant'),
  submittedOn: String(pick(row, 'submittedOn', 'submitted_on', 'created_at', 'submitted_date') ?? ''),
  status: String(pick(row, 'status', 'application_status') ?? 'Pending'),
  submittedBy: (pick(row, 'submittedBy', 'submitted_by', 'officer_name', 'created_by_name') as string | undefined) ?? null,
  division: pick(row, 'division', 'gnDivision', 'gn_division', 'sub_area'),
  place: pick(row, 'place', 'district', 'city'),
  type: pick(row, 'type', 'application_type', 'request_type'),
});
export const getNicPendingList = async () => {
  if (DEMO_MODE) {
    await wait();
    return demoQueue('All')
      .filter((item) => item.id.startsWith('NIC'))
      .map((item) => ({ ...item, submittedBy: 'Demo officer' }));
  }
  const rows = await apiClient.get<Record<string, any>[]>('/api/district/NicPendingList');
  return (rows ?? []).map(normalizeNicPendingItem).filter((item) => item.id);
};

// ── APPROVE / REJECT (needs the authorizing officer's username + service no + password) ──
// DistrictDashboardScreen + NicApplicationReviewScreen -> "Authorize" modal
// POST /api/district/Approve
// body : { app_ref, signoff_username, signoff_service_number, signoff_password }
export const approveApplication = async (appRef: string, credentials: SignOffCredentials) => {
  if (DEMO_MODE) {
    await wait();
    return demoDecide(appRef, 'APPROVE');
  }
  return apiClient.post<{ id: string; status: 'Approved' }>('/api/district/Approve', {
    app_ref: appRef,
    ...toSignoff(credentials),
  });
};

// POST /api/district/Reject
// body : { app_ref, reason, signoff_* }     reason is REQUIRED (the "Remarks" box on the review screen)
export const rejectApplication = async (appRef: string, reason: string, credentials: SignOffCredentials) => {
  if (DEMO_MODE) {
    await wait();
    return demoDecide(appRef, 'REJECT');
  }
  return apiClient.post<{ id: string; status: 'Rejected' }>('/api/district/Reject', {
    app_ref: appRef,
    reason,
    ...toSignoff(credentials),
  });
};

// ── REPORTS ────────────────────────────────────────────────────────────────
// ReportsScreen (placeholder for now) — District Registrar only
export type ReportType = 'All' | 'Birth' | 'Death' | 'Marriage' | 'NIC';

export interface ReportRow {
  report_id: number;
  report_type: ReportType;
  from_date: string;
  to_date: string;
  total_applications: number;
  approved_count: number;
  pending_count: number;
  rejected_count: number;
  created_at: string;
}

// POST /api/district/ReportGenerate
// body    : { report_type, from_date: 'yyyy-MM-dd', to_date: 'yyyy-MM-dd' }
// returns : { report: ReportRow, byCategory: [{ category, total, approved, pending, rejected }] }
export const generateReport = (reportType: ReportType, fromDate: string, toDate: string) =>
  apiClient.post<{
    report: ReportRow;
    byCategory: { category: string; total: number; approved: number; pending: number; rejected: number }[];
  }>('/api/district/ReportGenerate', { report_type: reportType, from_date: fromDate, to_date: toDate });

// GET /api/district/ReportList          -> last 10 generated reports
export const getReportList = () =>
  apiClient.get<(ReportRow & { generated_by_name: string | null })[]>('/api/district/ReportList');

// GET /api/district/ReportTrend         -> last 6 months, for the chart
export const getReportTrend = () => apiClient.get<{ month: string; total: number }[]>('/api/district/ReportTrend');

// ── ADD PROFILE (officer enrollment) ───────────────────────────────────────
// AddProfileScreen -> last step "Authorize & Submit"   (District Registrar only, needs the authorizing officer's credentials)
// POST /api/district/OfficerCreate
// body    : { username, password, service_number, role_name, officer_name, officer_phone, unit_name,
//             nic, date_of_birth: 'yyyy-MM-dd', gender, email, address, signoff_* }
// returns : { officer_id }
export interface NewOfficer {
  username: string;
  password: string;
  service_number: string;
  role_name: string; // roles.role_name, e.g. 'Village Officer'
  officer_name: string;
  officer_phone: string;
  unit_name: string;
  nic: string;
  date_of_birth: string; // yyyy-MM-dd
  gender: string; // Male | Female | Other
  email: string;
  address: string;
}
export const createOfficer = async (officer: NewOfficer, credentials: SignOffCredentials) => {
  if (DEMO_MODE) {
    await wait();
    return { officer_id: 0 };
  }
  return apiClient.post<{ officer_id: number }>('/api/district/OfficerCreate', {
    ...officer,
    ...toSignoff(credentials),
  });
};

// ── FIND PEOPLE ────────────────────────────────────────────────────────────
// FindPeopleScreen -> NIC or officer service number
// GET /api/district/FindPerson?search_value=199012345678     (no search_value = only the recent searches)
// returns : { person: FoundPerson | null, recent: [{ created_at, description }] }
export interface FoundPerson {
  person_type: 'Citizen' | 'Officer';
  person_id: number;
  full_name: string | null;
  nic: string | null;
  date_of_birth: string | null; // yyyy-MM-dd
  gender: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  service_number: string | null; // officers
  role_name: string | null; // officers
  unit_name: string | null; // officers
}
export interface RecentSearch {
  created_at: string;
  description: string; // 'Find person: <value> | <name or Not found>'
}
export interface FindPersonResult {
  person: FoundPerson | null;
  recent: RecentSearch[];
}
export const findPerson = async (searchValue?: string): Promise<FindPersonResult> => {
  if (DEMO_MODE) {
    await wait();
    const demo: FoundPerson | null = searchValue
      ? {
          person_type: 'Citizen', person_id: 1, full_name: 'Saman Perera', nic: searchValue, date_of_birth: '1990-05-14',
          gender: 'Male', phone: '0771234567', email: null, address: 'Colombo', service_number: null, role_name: null, unit_name: null,
        }
      : null;
    return { person: demo, recent: [] };
  }
  const res = await apiClient.get<FindPersonResult>('/api/district/FindPerson', { search_value: searchValue });
  return { person: res?.person ?? null, recent: res?.recent ?? [] };
};
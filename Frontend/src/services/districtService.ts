import { apiClient, toSignoff } from './apiClient';
import { DEMO_MODE } from '../config';
import { demoDecide, demoQueue, demoSummary, wait } from './demoData';
import type { SignOffCredentials } from '../types/auth';
import type { ApplicationItem, Category, DashboardSummary } from '../types/district';

// Needs permission APPLICATION_APPROVE (District Registrar). Reports need REPORT_VIEW / REPORT_GENERATE.

// ── DASHBOARD ──────────────────────────────────────────────────────────────
// DistrictDashboardScreen -> the 4 tiles
// GET /api/district/Summary
// returns : { pending, approved, rejected, totalRecords }
export const getDistrictSummary = async (): Promise<DashboardSummary> => {
  if (DEMO_MODE) {
    await wait();
    return demoSummary();
  }
  return apiClient.get<DashboardSummary>('/api/district/Summary');
};

// DistrictDashboardScreen -> category chips + application list (Birth / Death / Marriage; NIC is NOT in this list)
// GET /api/district/List?category=All|Birth|Death|Marriage
// returns : [{ id: 'BRT-000012', category, applicantName, submittedOn: 'yyyy-MM-dd', status }]
export const getDistrictQueue = async (category: Category): Promise<ApplicationItem[]> => {
  if (DEMO_MODE) {
    await wait();
    return demoQueue(category);
  }
  return apiClient.get<ApplicationItem[]>('/api/district/List', { category });
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
}
export const getNicPendingList = () => apiClient.get<NicPendingItem[]>('/api/district/NicPendingList');

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
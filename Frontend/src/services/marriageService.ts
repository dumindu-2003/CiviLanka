import { apiClient, toSignoff } from './apiClient';
import type { SignOffCredentials } from '../types/auth';
import type { AppDashboard, AppListItem, AppSaveResult, AppStatus } from '../types/application';

// Needs MARRIAGE_VIEW (read) / MARRIAGE_CREATE (write) - Marriage Registrar
// Statuses: Draft -> (Submit, needs sign-off) -> Pending -> Approved / Rejected (by the District Registrar)

// ── LIST ROW (MRG-000012) ────────────────────────────────────────────────────────
export interface MarriageListItem extends AppListItem {
  marriage_date: string; // "name" = "Groom & Bride"
}

// ── FORM DATA (goes inside "data" of Create / Update) ──────────────────────
export interface MarriageData {
  applicant_id: number;
  groom_name: string;
  groom_nic?: string;
  groom_dob?: string; // yyyy-MM-dd
  groom_age?: number;
  groom_occupation?: string;
  groom_address?: string;
  groom_religion?: string;
  groom_nationality?: string;
  groom_marital_status?: string;
  bride_name: string;
  bride_nic?: string;
  bride_dob?: string;
  bride_age?: number;
  bride_occupation?: string;
  bride_address?: string;
  bride_religion?: string;
  bride_nationality?: string;
  bride_marital_status?: string;
  marriage_date: string; // yyyy-MM-dd
  marriage_place?: string;
  marriage_registrar?: string;
  registration_number?: string;
  female_witness_name?: string;
  female_witness_nic?: string;
  female_witness_relationship?: string;
  female_witness_address?: string;
  female_witness_contact?: string;
  male_witness_name?: string;
  male_witness_nic?: string;
  male_witness_relationship?: string;
  male_witness_address?: string;
  male_witness_contact?: string;
}

// ── FULL RECORD (GET /api/marriage/Get) ─────────────────────────────────────────
export interface MarriageRecord extends MarriageData {
  marriage_app_id: number;
  app_ref: string;
  status: AppStatus;
  rejection_reason: string | null;
  created_at: string;
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────
// GET /api/marriage/Dashboard
// returns : { summary: { new_entries, pending, approved }, recent: [last 5 records] }
export const getMarriageDashboard = () => apiClient.get<AppDashboard>('/api/marriage/Dashboard');

// ── LIST ───────────────────────────────────────────────────────────────────
// GET /api/marriage/List?status=Draft|Pending|Approved|Rejected      (status optional = all my records)
export const getMarriageList = (status?: AppStatus) =>
  apiClient.get<MarriageListItem[]>('/api/marriage/List', { status });

// ── ONE RECORD ─────────────────────────────────────────────────────────────
// GET /api/marriage/Get?app_id=5
export const getMarriageById = (appId: number) => apiClient.get<MarriageRecord>('/api/marriage/Get', { app_id: appId });

// ── SAVE AS DRAFT ──────────────────────────────────────────────────────────
// POST /api/marriage/Create
// body    : { status: 'Draft', data: {...} }
// returns : { app_id, app_ref, status: 'Draft' }
export const createMarriageDraft = (data: MarriageData) =>
  apiClient.post<AppSaveResult>('/api/marriage/Create', { status: 'Draft', data });

// ── SAVE & SEND STRAIGHT TO PENDING (needs the authorizing officer) ────────
// POST /api/marriage/Create
// body    : { status: 'Pending', data: {...}, signoff_username, signoff_service_number, signoff_password }
export const createMarriageAndSubmit = (data: MarriageData, credentials: SignOffCredentials) =>
  apiClient.post<AppSaveResult>('/api/marriage/Create', { status: 'Pending', data, ...toSignoff(credentials) });

// ── EDIT (own Draft / Rejected record only, it goes back to Draft) ─────────
// POST /api/marriage/Update
// body    : { app_id, data: {...} }
export const updateMarriage = (appId: number, data: MarriageData) =>
  apiClient.post<AppSaveResult>('/api/marriage/Update', { app_id: appId, data });

// ── SUBMIT A DRAFT (Draft -> Pending, needs the authorizing officer) ───────
// POST /api/marriage/Submit
// body    : { app_id, signoff_username, signoff_service_number, signoff_password }
export const submitMarriage = (appId: number, credentials: SignOffCredentials) =>
  apiClient.post<AppSaveResult>('/api/marriage/Submit', { app_id: appId, ...toSignoff(credentials) });

// ── DELETE (own Draft only) ────────────────────────────────────────────────
// POST /api/marriage/Delete
// body    : { app_id }
export const deleteMarriageDraft = (appId: number) =>
  apiClient.post<{ app_id: number }>('/api/marriage/Delete', { app_id: appId });
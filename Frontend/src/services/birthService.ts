import { apiClient, toSignoff } from './apiClient';
import type { SignOffCredentials } from '../types/auth';
import type { AppDashboard, AppListItem, AppSaveResult, AppStatus } from '../types/application';

// Needs BIRTH_VIEW (read) / BIRTH_CREATE (write) - Birth Registrar
// Statuses: Draft -> (Submit, needs sign-off) -> Pending -> Approved / Rejected (by the District Registrar)

// ── LIST ROW (BRT-000012) ────────────────────────────────────────────────────────
export interface BirthListItem extends AppListItem {
  date_of_birth: string;
}

// ── FORM DATA (goes inside "data" of Create / Update) ──────────────────────
export interface BirthData {
  applicant_id: number; // citizens.citizen_id of the informant (citizenService.searchCitizens)
  baby_full_name: string;
  date_of_birth: string; // yyyy-MM-dd
  time_of_birth?: string; // HH:mm:ss
  place_of_birth?: string;
  gender?: string;
  birth_weight?: number;
  father_name?: string;
  father_nic?: string;
  father_occupation?: string;
  father_address?: string;
  mother_name?: string;
  mother_nic?: string;
  mother_occupation?: string;
  mother_address?: string;
  hospital_name?: string;
  registration_date?: string; // yyyy-MM-dd
}

// ── FULL RECORD (GET /api/birth/Get) ─────────────────────────────────────────
export interface BirthRecord extends BirthData {
  birth_app_id: number;
  app_ref: string;
  status: AppStatus;
  rejection_reason: string | null;
  created_at: string;
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────
// GET /api/birth/Dashboard
// returns : { summary: { new_entries, pending, approved }, recent: [last 5 records] }
export const getBirthDashboard = () => apiClient.get<AppDashboard>('/api/birth/Dashboard');

// ── LIST ───────────────────────────────────────────────────────────────────
// GET /api/birth/List?status=Draft|Pending|Approved|Rejected      (status optional = all my records)
export const getBirthList = (status?: AppStatus) =>
  apiClient.get<BirthListItem[]>('/api/birth/List', { status });

// ── ONE RECORD ─────────────────────────────────────────────────────────────
// GET /api/birth/Get?app_id=5
export const getBirthById = (appId: number) => apiClient.get<BirthRecord>('/api/birth/Get', { app_id: appId });

// ── SAVE AS DRAFT ──────────────────────────────────────────────────────────
// POST /api/birth/Create
// body    : { status: 'Draft', data: {...} }
// returns : { app_id, app_ref, status: 'Draft' }
export const createBirthDraft = (data: BirthData) =>
  apiClient.post<AppSaveResult>('/api/birth/Create', { status: 'Draft', data });

// ── SAVE & SEND STRAIGHT TO PENDING (needs the authorizing officer) ────────
// POST /api/birth/Create
// body    : { status: 'Pending', data: {...}, signoff_username, signoff_service_number, signoff_password }
export const createBirthAndSubmit = (data: BirthData, credentials: SignOffCredentials) =>
  apiClient.post<AppSaveResult>('/api/birth/Create', { status: 'Pending', data, ...toSignoff(credentials) });

// ── EDIT (own Draft / Rejected record only, it goes back to Draft) ─────────
// POST /api/birth/Update
// body    : { app_id, data: {...} }
export const updateBirth = (appId: number, data: BirthData) =>
  apiClient.post<AppSaveResult>('/api/birth/Update', { app_id: appId, data });

// ── SUBMIT A DRAFT (Draft -> Pending, needs the authorizing officer) ───────
// POST /api/birth/Submit
// body    : { app_id, signoff_username, signoff_service_number, signoff_password }
export const submitBirth = (appId: number, credentials: SignOffCredentials) =>
  apiClient.post<AppSaveResult>('/api/birth/Submit', { app_id: appId, ...toSignoff(credentials) });

// ── DELETE (own Draft only) ────────────────────────────────────────────────
// POST /api/birth/Delete
// body    : { app_id }
export const deleteBirthDraft = (appId: number) =>
  apiClient.post<{ app_id: number }>('/api/birth/Delete', { app_id: appId });
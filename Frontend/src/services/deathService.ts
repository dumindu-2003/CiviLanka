import { apiClient, toSignoff } from './apiClient';
import type { SignOffCredentials } from '../types/auth';
import type { AppDashboard, AppListItem, AppSaveResult, AppStatus } from '../types/application';

// Needs DEATH_VIEW (read) / DEATH_CREATE (write) - Death Registrar
// Statuses: Draft -> (Submit, needs sign-off) -> Pending -> Approved / Rejected (by the District Registrar)

// ── LIST ROW (DTH-000012) ────────────────────────────────────────────────────────
export interface DeathListItem extends AppListItem {
  date_of_death: string;
}

// ── FORM DATA (goes inside "data" of Create / Update) ──────────────────────
export interface DeathData {
  applicant_id: number; // citizens.citizen_id of the informant
  deceased_name: string;
  deceased_nic?: string;
  date_of_birth?: string; // yyyy-MM-dd
  date_of_death: string; // yyyy-MM-dd
  time_of_death?: string; // HH:mm:ss
  place_of_death?: string;
  gender?: string;
  age_at_death?: number;
  cause_of_death?: string;
  marital_status?: string;
  permanent_address?: string;
  informant_name?: string;
  informant_nic?: string;
  informant_relationship?: string;
  informant_contact?: string;
}

// ── FULL RECORD (GET /api/death/Get) ─────────────────────────────────────────
export interface DeathRecord extends DeathData {
  death_app_id: number;
  app_ref: string;
  status: AppStatus;
  rejection_reason: string | null;
  created_at: string;
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────
// GET /api/death/Dashboard
// returns : { summary: { new_entries, pending, approved }, recent: [last 5 records] }
export const getDeathDashboard = () => apiClient.get<AppDashboard>('/api/death/Dashboard');

// ── LIST ───────────────────────────────────────────────────────────────────
// GET /api/death/List?status=Draft|Pending|Approved|Rejected      (status optional = all my records)
export const getDeathList = (status?: AppStatus) =>
  apiClient.get<DeathListItem[]>('/api/death/List', { status });

// ── ONE RECORD ─────────────────────────────────────────────────────────────
// GET /api/death/Get?app_id=5
export const getDeathById = (appId: number) => apiClient.get<DeathRecord>('/api/death/Get', { app_id: appId });

// ── SAVE AS DRAFT ──────────────────────────────────────────────────────────
// POST /api/death/Create
// body    : { status: 'Draft', data: {...} }
// returns : { app_id, app_ref, status: 'Draft' }
export const createDeathDraft = (data: DeathData) =>
  apiClient.post<AppSaveResult>('/api/death/Create', { status: 'Draft', data });

// ── SAVE & SEND STRAIGHT TO PENDING (needs the authorizing officer) ────────
// POST /api/death/Create
// body    : { status: 'Pending', data: {...}, signoff_username, signoff_service_number, signoff_password }
export const createDeathAndSubmit = (data: DeathData, credentials: SignOffCredentials) =>
  apiClient.post<AppSaveResult>('/api/death/Create', { status: 'Pending', data, ...toSignoff(credentials) });

// ── EDIT (own Draft / Rejected record only, it goes back to Draft) ─────────
// POST /api/death/Update
// body    : { app_id, data: {...} }
export const updateDeath = (appId: number, data: DeathData) =>
  apiClient.post<AppSaveResult>('/api/death/Update', { app_id: appId, data });

// ── SUBMIT A DRAFT (Draft -> Pending, needs the authorizing officer) ───────
// POST /api/death/Submit
// body    : { app_id, signoff_username, signoff_service_number, signoff_password }
export const submitDeath = (appId: number, credentials: SignOffCredentials) =>
  apiClient.post<AppSaveResult>('/api/death/Submit', { app_id: appId, ...toSignoff(credentials) });

// ── DELETE (own Draft only) ────────────────────────────────────────────────
// POST /api/death/Delete
// body    : { app_id }
export const deleteDeathDraft = (appId: number) =>
  apiClient.post<{ app_id: number }>('/api/death/Delete', { app_id: appId });
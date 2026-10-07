import { apiClient, toSignoff } from './apiClient';
import type { SignOffCredentials } from '../types/auth';
import type { AppListItem, AppSaveResult, AppStatus } from '../types/application';

// Village Officer creates NIC applications; the District Registrar approves them (districtService). NIC has NO dashboard endpoint.
// Statuses: Draft -> (Submit, needs sign-off) -> Pending -> Approved / Rejected (by the District Registrar)

// ── LIST ROW (NIC-000012) ────────────────────────────────────────────────────────
export type NicListItem = AppListItem;

// ── FORM DATA (goes inside "data" of Create / Update) ──────────────────────
export interface NicData {
  applicant_id: number;
  full_name: string;
  date_of_birth?: string; // yyyy-MM-dd
  gender?: string;
  place_of_birth?: string;
  district?: string;
  religion?: string;
  occupation?: string;
  permanent_address?: string;
  current_address?: string;
  phone?: string;
  email?: string;
  father_name?: string;
  father_nic?: string;
  mother_name?: string;
  mother_nic?: string;
  marital_status?: string;
  spouse_name?: string;
}

// ── FULL RECORD (GET /api/nic/Get) ─────────────────────────────────────────
export interface NicRecord extends NicData {
  nic_app_id: number;
  app_ref: string;
  status: AppStatus;
  rejection_reason: string | null;
  created_at: string;
}

// ── LIST ───────────────────────────────────────────────────────────────────
// GET /api/nic/List?status=Draft|Pending|Approved|Rejected      (status optional = all my records)
export const getNicList = (status?: AppStatus) =>
  apiClient.get<NicListItem[]>('/api/nic/List', { status });

// ── ONE RECORD ─────────────────────────────────────────────────────────────
// GET /api/nic/Get?app_id=5
export const getNicById = (appId: number) => apiClient.get<NicRecord>('/api/nic/Get', { app_id: appId });

// ── SAVE AS DRAFT ──────────────────────────────────────────────────────────
// POST /api/nic/Create
// body    : { status: 'Draft', data: {...} }
// returns : { app_id, app_ref, status: 'Draft' }
export const createNicDraft = (data: NicData) =>
  apiClient.post<AppSaveResult>('/api/nic/Create', { status: 'Draft', data });

// ── SAVE & SEND STRAIGHT TO PENDING (needs the authorizing officer) ────────
// POST /api/nic/Create
// body    : { status: 'Pending', data: {...}, signoff_username, signoff_service_number, signoff_password }
export const createNicAndSubmit = (data: NicData, credentials: SignOffCredentials) =>
  apiClient.post<AppSaveResult>('/api/nic/Create', { status: 'Pending', data, ...toSignoff(credentials) });

// ── EDIT (own Draft / Rejected record only, it goes back to Draft) ─────────
// POST /api/nic/Update
// body    : { app_id, data: {...} }
export const updateNic = (appId: number, data: NicData) =>
  apiClient.post<AppSaveResult>('/api/nic/Update', { app_id: appId, data });

// ── SUBMIT A DRAFT (Draft -> Pending, needs the authorizing officer) ───────
// POST /api/nic/Submit
// body    : { app_id, signoff_username, signoff_service_number, signoff_password }
export const submitNic = (appId: number, credentials: SignOffCredentials) =>
  apiClient.post<AppSaveResult>('/api/nic/Submit', { app_id: appId, ...toSignoff(credentials) });

// ── DELETE (own Draft only) ────────────────────────────────────────────────
// POST /api/nic/Delete
// body    : { app_id }
export const deleteNicDraft = (appId: number) =>
  apiClient.post<{ app_id: number }>('/api/nic/Delete', { app_id: appId });
import { apiClient, toSignoff } from './apiClient';
import type { SignOffCredentials } from '../types/auth';
import type { AppDashboard, AppListItem, AppSaveResult, AppStatus } from '../types/application';
import type { BirthApplication, BirthApplicationPayload } from '../types/birth';

// Needs BIRTH_VIEW (read) / BIRTH_CREATE (write) - Birth Registrar
// Statuses: Draft -> (Submit, needs sign-off) -> Pending -> Approved / Rejected (by the District Registrar)

// ── LIST ROW (BRT-000012) ────────────────────────────────────────────────────────
export interface BirthListItem extends AppListItem {
  date_of_birth: string;
}

// ── FORM DATA (goes inside "data" of Create / Update) ──────────────────────
export interface BirthData {
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

const emptyPayload = (): BirthApplicationPayload => ({
  babyName: '',
  birthDate: '',
  birthTime: '',
  birthPlace: '',
  gender: '',
  birthWeight: '',
  fatherName: '',
  fatherNic: '',
  fatherOccupation: '',
  fatherAddress: '',
  motherName: '',
  motherNic: '',
  motherOccupation: '',
  motherAddress: '',
  hospitalName: '',
  registrationDate: '',
});

const dateForInput = (value?: string | null) => value?.slice(0, 10) ?? '';
const timeForInput = (value?: string | null) => value?.split('T').pop() ?? '';
const optionalText = (value: string) => value.trim() || undefined;

function toDate(value: string, label: string, required: true): string;
function toDate(value: string, label: string, required?: false): string | undefined;
function toDate(value: string, label: string, required = false): string | undefined {
  const date = value.trim();
  if (!date && !required) return undefined;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`${label} must use the YYYY-MM-DD format.`);
  }
  return date;
}

const toTime = (value: string): string | undefined => {
  const time = value.trim();
  if (!time) return undefined;
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(time);
  if (!match) throw new Error('Time of birth must use the HH:mm or HH:mm:ss format.');
  return `${match[1]}:${match[2]}:${match[3] ?? '00'}`;
};

const toNumber = (value: string, label: string): number | undefined => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${label} must be a valid non-negative number.`);
  }
  return parsed;
};

const toBirthData = (payload: BirthApplicationPayload): BirthData => {
  const babyName = payload.babyName.trim();
  if (!babyName) throw new Error("Enter the child's full legal name.");

  return {
    baby_full_name: babyName,
    date_of_birth: toDate(payload.birthDate, 'Date of birth', true),
    time_of_birth: toTime(payload.birthTime),
    place_of_birth: optionalText(payload.birthPlace),
    gender: optionalText(payload.gender),
    birth_weight: toNumber(payload.birthWeight, 'Birth weight'),
    father_name: optionalText(payload.fatherName),
    father_nic: optionalText(payload.fatherNic),
    father_occupation: optionalText(payload.fatherOccupation),
    father_address: optionalText(payload.fatherAddress),
    mother_name: optionalText(payload.motherName),
    mother_nic: optionalText(payload.motherNic),
    mother_occupation: optionalText(payload.motherOccupation),
    mother_address: optionalText(payload.motherAddress),
    hospital_name: optionalText(payload.hospitalName),
    registration_date: toDate(payload.registrationDate, 'Registration date'),
  };
};

const mapBirthRecord = (record: BirthRecord): BirthApplication => ({
  ...emptyPayload(),
  babyName: record.baby_full_name ?? '',
  birthDate: dateForInput(record.date_of_birth),
  birthTime: timeForInput(record.time_of_birth),
  birthPlace: record.place_of_birth ?? '',
  gender: record.gender ?? '',
  birthWeight: record.birth_weight == null ? '' : String(record.birth_weight),
  fatherName: record.father_name ?? '',
  fatherNic: record.father_nic ?? '',
  fatherOccupation: record.father_occupation ?? '',
  fatherAddress: record.father_address ?? '',
  motherName: record.mother_name ?? '',
  motherNic: record.mother_nic ?? '',
  motherOccupation: record.mother_occupation ?? '',
  motherAddress: record.mother_address ?? '',
  hospitalName: record.hospital_name ?? '',
  registrationDate: dateForInput(record.registration_date),
  id: String(record.birth_app_id),
  appRef: record.app_ref,
  applicantId: '',
  status: record.status,
  rejectionReason: record.rejection_reason ?? '',
  submittedOn: record.created_at ?? '',
  submittedBy: '',
  signedOffBy: '',
  approvedBy: '',
  approvedAt: '',
  createdAt: record.created_at ?? '',
  updatedAt: '',
  createdBy: '',
  updatedBy: '',
});

const mapBirthListItem = (item: BirthListItem): BirthApplication => ({
  ...emptyPayload(),
  babyName: item.name,
  birthDate: dateForInput(item.date_of_birth),
  id: String(item.app_id),
  appRef: item.app_ref,
  applicantId: '',
  status: item.status,
  rejectionReason: item.rejection_reason ?? '',
  submittedOn: item.created_at,
  submittedBy: '',
  signedOffBy: '',
  approvedBy: '',
  approvedAt: '',
  createdAt: item.created_at,
  updatedAt: '',
  createdBy: '',
  updatedBy: '',
});

const toAppId = (id: string): number => {
  const appId = Number(id);
  if (!Number.isInteger(appId) || appId <= 0) {
    throw new Error('The application ID is invalid.');
  }
  return appId;
};

export const birthService = {
  async getQueue(): Promise<BirthApplication[]> {
    return (await getBirthList()).map(mapBirthListItem);
  },

  async get(id: string): Promise<BirthApplication> {
    return mapBirthRecord(await getBirthById(toAppId(id)));
  },

  async create(
    payload: BirthApplicationPayload,
    status: 'Draft' | 'Pending',
    credentials?: SignOffCredentials,
  ): Promise<AppSaveResult> {
    const data = toBirthData(payload);
    if (status === 'Draft') return createBirthDraft(data);
    if (!credentials) throw new Error('Sign-off credentials are required to submit.');
    return createBirthAndSubmit(data, credentials);
  },

  async update(id: string, payload: BirthApplicationPayload): Promise<AppSaveResult> {
    return updateBirth(toAppId(id), toBirthData(payload));
  },

  async submit(id: string, credentials: SignOffCredentials): Promise<AppSaveResult> {
    return submitBirth(toAppId(id), credentials);
  },
};
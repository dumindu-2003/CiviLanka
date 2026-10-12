import { apiClient, toSignoff } from './apiClient';
import type { SignOffCredentials } from '../types/auth';
import type { AppDashboard, AppListItem, AppSaveResult, AppStatus } from '../types/application';
import type { DeathApplication, DeathApplicationPayload } from '../types/death';

// Needs DEATH_VIEW (read) / DEATH_CREATE (write) - Death Registrar
// Statuses: Draft -> (Submit, needs sign-off) -> Pending -> Approved / Rejected (by the District Registrar)

// ── LIST ROW (DTH-000012) ────────────────────────────────────────────────────────
export interface DeathListItem extends AppListItem {
  date_of_death: string;
}

// ── FORM DATA (goes inside "data" of Create / Update) ──────────────────────
export interface DeathData {
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

const emptyPayload = (): DeathApplicationPayload => ({
  informantName: '',
  nic: '',
  relationship: '',
  informantContact: '',
  placeOfDemise: '',
  dateOfDemise: '',
  timeOfDemise: '',
  deceasedNic: '',
  deceasedName: '',
  gender: '',
  dateOfBirth: '',
  ageAtDeath: '',
  causeOfDeath: '',
  maritalStatus: '',
  deceasedAddress: '',
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
  if (!match) throw new Error('Time of death must use the HH:mm or HH:mm:ss format.');
  return `${match[1]}:${match[2]}:${match[3] ?? '00'}`;
};

const toNumber = (value: string, label: string): number | undefined => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${label} must be a valid non-negative whole number.`);
  }
  return parsed;
};

const toDeathData = (payload: DeathApplicationPayload): DeathData => {
  const deceasedName = payload.deceasedName.trim();
  if (!deceasedName) throw new Error("Enter the deceased person's full legal name.");

  return {
    deceased_name: deceasedName,
    deceased_nic: optionalText(payload.deceasedNic),
    date_of_birth: toDate(payload.dateOfBirth, 'Date of birth'),
    date_of_death: toDate(payload.dateOfDemise, 'Date of death', true),
    time_of_death: toTime(payload.timeOfDemise),
    place_of_death: optionalText(payload.placeOfDemise),
    gender: optionalText(payload.gender),
    age_at_death: toNumber(payload.ageAtDeath, 'Age at death'),
    cause_of_death: optionalText(payload.causeOfDeath),
    marital_status: optionalText(payload.maritalStatus),
    permanent_address: optionalText(payload.deceasedAddress),
    informant_name: optionalText(payload.informantName),
    informant_nic: optionalText(payload.nic),
    informant_relationship: optionalText(payload.relationship),
    informant_contact: optionalText(payload.informantContact),
  };
};

const mapDeathRecord = (record: DeathRecord): DeathApplication => ({
  ...emptyPayload(),
  deceasedName: record.deceased_name ?? '',
  deceasedNic: record.deceased_nic ?? '',
  dateOfBirth: dateForInput(record.date_of_birth),
  dateOfDemise: dateForInput(record.date_of_death),
  timeOfDemise: timeForInput(record.time_of_death),
  placeOfDemise: record.place_of_death ?? '',
  gender: record.gender ?? '',
  ageAtDeath: record.age_at_death == null ? '' : String(record.age_at_death),
  causeOfDeath: record.cause_of_death ?? '',
  maritalStatus: record.marital_status ?? '',
  deceasedAddress: record.permanent_address ?? '',
  informantName: record.informant_name ?? '',
  nic: record.informant_nic ?? '',
  relationship: record.informant_relationship ?? '',
  informantContact: record.informant_contact ?? '',
  id: String(record.death_app_id),
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

const mapDeathListItem = (item: DeathListItem): DeathApplication => ({
  ...emptyPayload(),
  deceasedName: item.name,
  dateOfDemise: dateForInput(item.date_of_death),
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

export const deathService = {
  async getQueue(): Promise<DeathApplication[]> {
    return (await getDeathList()).map(mapDeathListItem);
  },

  async get(id: string): Promise<DeathApplication> {
    return mapDeathRecord(await getDeathById(toAppId(id)));
  },

  async create(
    payload: DeathApplicationPayload,
    status: 'Draft' | 'Pending',
    credentials?: SignOffCredentials,
  ): Promise<AppSaveResult> {
    const data = toDeathData(payload);
    if (status === 'Draft') return createDeathDraft(data);
    if (!credentials) throw new Error('Sign-off credentials are required to submit.');
    return createDeathAndSubmit(data, credentials);
  },

  async update(id: string, payload: DeathApplicationPayload): Promise<AppSaveResult> {
    return updateDeath(toAppId(id), toDeathData(payload));
  },

  async submit(id: string, credentials: SignOffCredentials): Promise<AppSaveResult> {
    return submitDeath(toAppId(id), credentials);
  },
};
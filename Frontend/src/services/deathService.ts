import { requestApi } from './apiClient';
import type { SignOffCredentials } from '../types/auth';
import type {
  DeathApplication,
  DeathApplicationPayload,
  DeathStatus,
  DeathSummary,
} from '../types/death';

type ApiRecord = Record<string, unknown>;

const ROUTE = 'death';

function readValue(record: ApiRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (value !== null && value !== undefined) return String(value);
  }
  return '';
}

function normalizeStatus(value: string): DeathStatus {
  const status = value.toLowerCase();
  if (status === 'draft' || status === 'open') return 'Draft';
  if (status === 'pending') return 'Pending';
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  throw new Error(`The death API returned an unsupported status: ${value || '(empty)'}`);
}

function toDeathApplication(value: unknown): DeathApplication {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('The death API returned an invalid application record.');
  }
  const row = value as ApiRecord;
  const id = readValue(row, 'death_app_id', 'app_id');
  if (!id) throw new Error('The death API returned a record without a death_app_id.');

  return {
    id,
    appRef: readValue(row, 'app_ref'),
    applicantId: readValue(row, 'applicant_id'),
    deceasedName: readValue(row, 'deceased_name'),
    deceasedNic: readValue(row, 'deceased_nic'),
    dateOfBirth: readValue(row, 'date_of_birth'),
    dateOfDemise: readValue(row, 'date_of_death'),
    timeOfDemise: readValue(row, 'time_of_death'),
    placeOfDemise: readValue(row, 'place_of_death'),
    gender: readValue(row, 'gender'),
    ageAtDeath: readValue(row, 'age_at_death'),
    causeOfDeath: readValue(row, 'cause_of_death'),
    maritalStatus: readValue(row, 'marital_status'),
    deceasedAddress: readValue(row, 'permanent_address'),
    informantName: readValue(row, 'informant_name'),
    nic: readValue(row, 'informant_nic'),
    relationship: readValue(row, 'informant_relationship'),
    informantContact: readValue(row, 'informant_contact'),
    status: normalizeStatus(readValue(row, 'status')),
    rejectionReason: readValue(row, 'rejection_reason'),
    submittedOn: readValue(row, 'created_at'),
    submittedBy: readValue(row, 'submitted_by'),
    signedOffBy: readValue(row, 'signed_off_by'),
    approvedBy: readValue(row, 'approved_by'),
    approvedAt: readValue(row, 'approved_at'),
    createdAt: readValue(row, 'created_at'),
    updatedAt: readValue(row, 'updated_at'),
    createdBy: readValue(row, 'created_by'),
    updatedBy: readValue(row, 'updated_by'),
  };
}

function toApiData(payload: DeathApplicationPayload): ApiRecord {
  return {
    deceased_name: payload.deceasedName,
    deceased_nic: payload.deceasedNic,
    date_of_birth: payload.dateOfBirth,
    date_of_death: payload.dateOfDemise,
    time_of_death: payload.timeOfDemise,
    place_of_death: payload.placeOfDemise,
    gender: payload.gender,
    age_at_death: payload.ageAtDeath,
    cause_of_death: payload.causeOfDeath,
    marital_status: payload.maritalStatus,
    permanent_address: payload.deceasedAddress,
    informant_name: payload.informantName,
    informant_nic: payload.nic,
    informant_relationship: payload.relationship,
    informant_contact: payload.informantContact,
  };
}

export const deathService = {
  getSummary: async (): Promise<DeathSummary> => {
    const applications = await deathService.getQueue();
    return {
      newEntries: applications.filter((item) => item.status === 'Draft').length,
      pending: applications.filter((item) => item.status === 'Pending').length,
      approved: applications.filter((item) => item.status === 'Approved').length,
      totalRecords: applications.length,
    };
  },

  getQueue: async (): Promise<DeathApplication[]> => {
    const rows = await requestApi<unknown[]>(`${ROUTE}/List`, 'GET');
    if (!Array.isArray(rows)) throw new Error('The death API returned an invalid application list.');
    return rows.map(toDeathApplication);
  },

  get: async (id: string): Promise<DeathApplication> =>
    toDeathApplication(
      await requestApi<unknown>(`${ROUTE}/Get`, 'GET', undefined, { app_id: id }),
    ),

  create: async (
    payload: DeathApplicationPayload,
    status: 'Draft' | 'Pending',
    credentials?: SignOffCredentials,
  ): Promise<null> => {
    await requestApi<unknown>(`${ROUTE}/Create`, 'POST', {
      status,
      data: toApiData(payload),
      ...(credentials
        ? {
            signoff_username: credentials.officerUserName,
            signoff_service_number: credentials.authorizingServiceNo,
            signoff_password: credentials.officerPassword,
          }
        : {}),
    });
    return null;
  },

  update: async (
    id: string,
    payload: DeathApplicationPayload,
  ): Promise<null> => {
    const appId = Number(id);
    if (!Number.isSafeInteger(appId) || appId <= 0) {
      throw new Error('The death application ID must be a positive integer.');
    }
    await requestApi<unknown>(`${ROUTE}/Update`, 'POST', {
      app_id: appId,
      data: toApiData(payload),
    });
    return null;
  },

  submit: async (id: string, credentials: SignOffCredentials): Promise<null> => {
    const appId = Number(id);
    if (!Number.isSafeInteger(appId) || appId <= 0) {
      throw new Error('The death application ID must be a positive integer.');
    }
    await requestApi<unknown>(`${ROUTE}/Submit`, 'POST', {
      app_id: appId,
      signoff_username: credentials.officerUserName,
      signoff_service_number: credentials.authorizingServiceNo,
      signoff_password: credentials.officerPassword,
    });
    return null;
  },
};

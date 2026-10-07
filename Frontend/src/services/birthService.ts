import { requestApi } from './apiClient';
import type { SignOffCredentials } from '../types/auth';
import type {
  BirthApplication,
  BirthApplicationPayload,
  BirthStatus,
  BirthSummary,
} from '../types/birth';

type ApiRecord = Record<string, unknown>;

const ROUTE = 'birth';

function readValue(record: ApiRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (value !== null && value !== undefined) return String(value);
  }
  return '';
}

function normalizeStatus(value: string): BirthStatus {
  const status = value.toLowerCase();
  if (status === 'draft' || status === 'open') return 'Draft';
  if (status === 'pending') return 'Pending';
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  throw new Error(`The birth API returned an unsupported status: ${value || '(empty)'}`);
}

function toBirthApplication(value: unknown): BirthApplication {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('The birth API returned an invalid application record.');
  }
  const row = value as ApiRecord;
  const id = readValue(row, 'birth_app_id', 'app_id');
  if (!id) throw new Error('The birth API returned a record without a birth_app_id.');

  return {
    id,
    appRef: readValue(row, 'app_ref'),
    applicantId: readValue(row, 'applicant_id'),
    babyName: readValue(row, 'baby_full_name'),
    birthDate: readValue(row, 'date_of_birth'),
    birthTime: readValue(row, 'time_of_birth'),
    birthPlace: readValue(row, 'place_of_birth'),
    gender: readValue(row, 'gender'),
    birthWeight: readValue(row, 'birth_weight'),
    fatherName: readValue(row, 'father_name'),
    fatherNic: readValue(row, 'father_nic'),
    fatherOccupation: readValue(row, 'father_occupation'),
    fatherAddress: readValue(row, 'father_address'),
    motherName: readValue(row, 'mother_name'),
    motherNic: readValue(row, 'mother_nic'),
    motherOccupation: readValue(row, 'mother_occupation'),
    motherAddress: readValue(row, 'mother_address'),
    hospitalName: readValue(row, 'hospital_name'),
    registrationDate: readValue(row, 'registration_date'),
    status: normalizeStatus(readValue(row, 'status')),
    rejectionReason: readValue(row, 'rejection_reason'),
    submittedOn: readValue(row, 'created_at', 'registration_date'),
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

function toApiData(payload: BirthApplicationPayload): ApiRecord {
  return {
    baby_full_name: payload.babyName,
    date_of_birth: payload.birthDate,
    time_of_birth: payload.birthTime,
    place_of_birth: payload.birthPlace,
    gender: payload.gender,
    birth_weight: payload.birthWeight,
    father_name: payload.fatherName,
    father_nic: payload.fatherNic,
    father_occupation: payload.fatherOccupation,
    father_address: payload.fatherAddress,
    mother_name: payload.motherName,
    mother_nic: payload.motherNic,
    mother_occupation: payload.motherOccupation,
    mother_address: payload.motherAddress,
    hospital_name: payload.hospitalName,
    registration_date: payload.registrationDate,
  };
}

export const birthService = {
  getSummary: async (): Promise<BirthSummary> => {
    const applications = await birthService.getQueue();
    return {
      newEntries: applications.filter((item) => item.status === 'Draft').length,
      pending: applications.filter((item) => item.status === 'Pending').length,
      approved: applications.filter((item) => item.status === 'Approved').length,
      totalRecords: applications.length,
    };
  },

  getQueue: async (): Promise<BirthApplication[]> => {
    const rows = await requestApi<unknown[]>(`${ROUTE}/List`, 'GET');
    if (!Array.isArray(rows)) throw new Error('The birth API returned an invalid application list.');
    return rows.map(toBirthApplication);
  },

  get: async (id: string): Promise<BirthApplication> =>
    toBirthApplication(
      await requestApi<unknown>(`${ROUTE}/Get`, 'GET', undefined, { app_id: id }),
    ),

  create: async (
    payload: BirthApplicationPayload,
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
    payload: BirthApplicationPayload,
  ): Promise<null> => {
    const appId = Number(id);
    if (!Number.isSafeInteger(appId) || appId <= 0) {
      throw new Error('The birth application ID must be a positive integer.');
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
      throw new Error('The birth application ID must be a positive integer.');
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

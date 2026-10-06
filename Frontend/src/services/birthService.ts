import { requestApi } from './apiClient';
import { DEMO_MODE } from '../config';
import type { SignOffCredentials } from '../types/auth';
import type { BirthApplication, BirthApplicationPayload, BirthStatus, BirthSummary } from '../types/birth';

type ApiRecord = Record<string, unknown>;

const ROUTE = 'birth';
const wait = (ms = 250) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const demoApplications: BirthApplication[] = [
  {
    id: 'B001',
    applicantName: 'Kavinda Jayasuriya',
    applicantNic: '',
    applicantDob: '',
    applicantAddress: '',
    babyName: 'Thisal Methuja',
    birthDate: '2026-09-01',
    birthTime: '',
    birthPlace: 'Colombo National Hospital',
    gender: 'Male',
    birthWeight: '',
    fatherName: 'Kavinda Jayasuriya',
    fatherNic: '',
    fatherOccupation: '',
    fatherAddress: '',
    motherName: 'Thilini Senanayake',
    motherNic: '',
    motherOccupation: '',
    motherAddress: '',
    medicalOfficer: '',
    registrationDate: '',
    status: 'Pending',
    submittedOn: '2026-09-01',
  },
];

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
  const id = readValue(row, 'app_id', 'application_id', 'id');
  if (!id) throw new Error('The birth API returned a record without an application ID.');

  return {
    id,
    status: normalizeStatus(readValue(row, 'status')),
    submittedOn: readValue(row, 'submitted_on', 'created_at', 'registration_date'),
    applicantName: readValue(row, 'applicant_name', 'applicantName'),
    applicantNic: readValue(row, 'applicant_nic', 'applicantNic'),
    applicantDob: readValue(row, 'applicant_date_of_birth', 'applicant_dob', 'applicantDob'),
    applicantAddress: readValue(row, 'applicant_address', 'applicantAddress'),
    babyName: readValue(row, 'baby_full_name', 'baby_name', 'babyName'),
    birthDate: readValue(row, 'date_of_birth', 'birth_date', 'birthDate'),
    birthTime: readValue(row, 'time_of_birth', 'birth_time', 'birthTime'),
    birthPlace: readValue(row, 'place_of_birth', 'birth_place', 'birthPlace'),
    gender: readValue(row, 'gender') === 'Female' ? 'Female' : 'Male',
    birthWeight: readValue(row, 'birth_weight', 'birthWeight'),
    fatherName: readValue(row, 'father_full_name', 'father_name', 'fatherName'),
    fatherNic: readValue(row, 'father_nic', 'fatherNic'),
    fatherOccupation: readValue(row, 'father_occupation', 'fatherOccupation'),
    fatherAddress: readValue(row, 'father_address', 'fatherAddress'),
    motherName: readValue(row, 'mother_full_name', 'mother_name', 'motherName'),
    motherNic: readValue(row, 'mother_nic', 'motherNic'),
    motherOccupation: readValue(row, 'mother_occupation', 'motherOccupation'),
    motherAddress: readValue(row, 'mother_address', 'motherAddress'),
    medicalOfficer: readValue(row, 'medical_officer_name', 'medical_officer', 'medicalOfficer'),
    registrationDate: readValue(row, 'registration_date', 'registrationDate'),
  };
}

function toApiData(payload: BirthApplicationPayload): ApiRecord {
  return {
    applicant_name: payload.applicantName,
    applicant_nic: payload.applicantNic,
    applicant_date_of_birth: payload.applicantDob,
    applicant_address: payload.applicantAddress,
    baby_full_name: payload.babyName,
    date_of_birth: payload.birthDate,
    time_of_birth: payload.birthTime,
    place_of_birth: payload.birthPlace,
    gender: payload.gender,
    birth_weight: payload.birthWeight,
    father_full_name: payload.fatherName,
    father_nic: payload.fatherNic,
    father_occupation: payload.fatherOccupation,
    father_address: payload.fatherAddress,
    mother_full_name: payload.motherName,
    mother_nic: payload.motherNic,
    mother_occupation: payload.motherOccupation,
    mother_address: payload.motherAddress,
    medical_officer_name: payload.medicalOfficer,
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
    if (DEMO_MODE) {
      await wait();
      return demoApplications.map((item) => ({ ...item }));
    }
    const rows = await requestApi<unknown[]>(`${ROUTE}/List`, 'GET');
    if (!Array.isArray(rows)) throw new Error('The birth API returned an invalid application list.');
    return rows.map(toBirthApplication);
  },

  get: async (id: string): Promise<BirthApplication> => {
    if (DEMO_MODE) {
      await wait();
      const item = demoApplications.find((application) => application.id === id);
      if (!item) throw new Error('Birth application not found.');
      return { ...item };
    }
    return toBirthApplication(
      await requestApi<unknown>(`${ROUTE}/Get`, 'GET', undefined, { app_id: id }),
    );
  },

  create: async (
    payload: BirthApplicationPayload,
    status: 'Draft' | 'Pending',
    credentials?: SignOffCredentials,
  ): Promise<null> => {
    if (DEMO_MODE) {
      await wait();
      demoApplications.unshift({
        ...payload,
        id: `B${String(Date.now()).slice(-6)}`,
        status,
        submittedOn: new Date().toISOString().slice(0, 10),
      });
      return null;
    }
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
    status: BirthStatus,
  ): Promise<null> => {
    if (DEMO_MODE) {
      await wait();
      const item = demoApplications.find((application) => application.id === id);
      if (!item) throw new Error('Birth application not found.');
      Object.assign(item, payload, { status });
      return null;
    }
    await requestApi<unknown>(`${ROUTE}/Update`, 'POST', {
      app_id: Number(id),
      status,
      data: toApiData(payload),
    });
    return null;
  },

  submit: async (id: string, credentials: SignOffCredentials): Promise<null> => {
    if (DEMO_MODE) {
      await wait();
      const item = demoApplications.find((application) => application.id === id);
      if (!item) throw new Error('Birth application not found.');
      item.status = 'Pending';
      return null;
    }
    await requestApi<unknown>(`${ROUTE}/Submit`, 'POST', {
      app_id: Number(id),
      signoff_username: credentials.officerUserName,
      signoff_service_number: credentials.authorizingServiceNo,
      signoff_password: credentials.officerPassword,
    });
    return null;
  },
};

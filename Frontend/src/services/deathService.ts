import { requestApi } from './apiClient';
import { DEMO_MODE } from '../config';
import type { SignOffCredentials } from '../types/auth';
import type { DeathApplication, DeathApplicationPayload, DeathStatus, DeathSummary } from '../types/death';

type ApiRecord = Record<string, unknown>;

const ROUTE = 'death';
const wait = (ms = 250) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const demoApplications: DeathApplication[] = [
  {
    id: 'D001',
    certificateType: 'Death Certificate (Official Notification)',
    informantName: 'Kasun Jayawardena',
    nic: '198224501239',
    relationship: 'Son',
    informantContact: '+94 77 341 9820',
    informantAddress: 'Colombo 07',
    placeOfDemise: 'Hospital',
    dateOfDemise: '2026-08-28',
    timeOfDemise: '06:45 AM',
    deceasedNic: '195412803129V',
    deceasedName: 'Hewage Don Karunadasa',
    gender: 'Male',
    dateOfBirth: '1954-04-12',
    maritalStatus: 'Widowed',
    occupation: 'Retired Civil Servant',
    deceasedAddress: 'Kalutara North',
    causeOfDeath: 'Natural causes',
    status: 'Pending',
    submittedOn: '2026-08-28',
  },
];

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
  const id = readValue(row, 'app_id', 'application_id', 'id');
  if (!id) throw new Error('The death API returned a record without an application ID.');

  return {
    id,
    status: normalizeStatus(readValue(row, 'status')),
    submittedOn: readValue(row, 'submitted_on', 'created_at', 'registration_date'),
    certificateType: readValue(row, 'certificate_type', 'certificateType'),
    informantName: readValue(row, 'informant_name', 'informantName'),
    nic: readValue(row, 'informant_nic', 'nic'),
    relationship: readValue(row, 'relationship'),
    informantContact: readValue(row, 'informant_contact', 'informantContact'),
    informantAddress: readValue(row, 'informant_address', 'informantAddress'),
    placeOfDemise: readValue(row, 'place_of_demise', 'place_of_death', 'placeOfDemise'),
    dateOfDemise: readValue(row, 'date_of_demise', 'date_of_death', 'dateOfDemise'),
    timeOfDemise: readValue(row, 'time_of_demise', 'time_of_death', 'timeOfDemise'),
    deceasedNic: readValue(row, 'deceased_nic', 'deceasedNic'),
    deceasedName: readValue(row, 'deceased_full_name', 'deceased_name', 'deceasedName'),
    gender: readValue(row, 'gender'),
    dateOfBirth: readValue(row, 'date_of_birth', 'dateOfBirth'),
    maritalStatus: readValue(row, 'marital_status', 'maritalStatus'),
    occupation: readValue(row, 'occupation'),
    deceasedAddress: readValue(row, 'deceased_address', 'deceasedAddress'),
    causeOfDeath: readValue(row, 'cause_of_death', 'causeOfDeath'),
  };
}

function toApiData(payload: DeathApplicationPayload): ApiRecord {
  return {
    certificate_type: payload.certificateType,
    informant_name: payload.informantName,
    informant_nic: payload.nic,
    relationship: payload.relationship,
    informant_contact: payload.informantContact,
    informant_address: payload.informantAddress,
    place_of_demise: payload.placeOfDemise,
    date_of_demise: payload.dateOfDemise,
    time_of_demise: payload.timeOfDemise,
    deceased_nic: payload.deceasedNic,
    deceased_full_name: payload.deceasedName,
    gender: payload.gender,
    date_of_birth: payload.dateOfBirth,
    marital_status: payload.maritalStatus,
    occupation: payload.occupation,
    deceased_address: payload.deceasedAddress,
    cause_of_death: payload.causeOfDeath,
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
    if (DEMO_MODE) {
      await wait();
      return demoApplications.map((item) => ({ ...item }));
    }
    const rows = await requestApi<unknown[]>(`${ROUTE}/List`, 'GET');
    if (!Array.isArray(rows)) throw new Error('The death API returned an invalid application list.');
    return rows.map(toDeathApplication);
  },

  get: async (id: string): Promise<DeathApplication> => {
    if (DEMO_MODE) {
      await wait();
      const item = demoApplications.find((application) => application.id === id);
      if (!item) throw new Error('Death application not found.');
      return { ...item };
    }
    return toDeathApplication(
      await requestApi<unknown>(`${ROUTE}/Get`, 'GET', undefined, { app_id: id }),
    );
  },

  create: async (
    payload: DeathApplicationPayload,
    status: 'Draft' | 'Pending',
    credentials?: SignOffCredentials,
  ): Promise<null> => {
    if (DEMO_MODE) {
      await wait();
      demoApplications.unshift({
        ...payload,
        id: `D${String(Date.now()).slice(-6)}`,
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
    payload: DeathApplicationPayload,
    status: DeathStatus,
  ): Promise<null> => {
    if (DEMO_MODE) {
      await wait();
      const item = demoApplications.find((application) => application.id === id);
      if (!item) throw new Error('Death application not found.');
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
      if (!item) throw new Error('Death application not found.');
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

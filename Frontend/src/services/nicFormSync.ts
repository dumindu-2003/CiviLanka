import { createCitizen, updateCitizen } from './citizenService';
import {
  createNicDraft,
  submitNic,
  updateNic,
  uploadNicDocument,
  type NicData,
  type NicDocument,
} from './nicService';
import type { SignOffCredentials } from '../types/auth';

export interface NicPersonalSnapshot {
  fullName: string;
  dob: string;
  gender: string;
  placeOfBirth: string;
  district: string;
  religion: string;
  occupation: string;
}

export interface NicContactSnapshot {
  permanentAddress: string;
  currentAddress: string;
  sameAsPermanent: boolean;
  phone: string;
  email: string;
  fatherName: string;
  fatherNic: string;
  motherName: string;
  motherNic: string;
  maritalStatus: string;
}

export interface NicFileSnapshot {
  name: string;
  uri: string;
  size?: number;
}

let personal: NicPersonalSnapshot | null = null;
let contact: NicContactSnapshot | null = null;
let files: Partial<Record<NicDocument['document_key'], NicFileSnapshot>> = {};

let citizenId: number | null = null;
let appId: number | null = null;
let savedReference: string | null = null;
let submitted = false;

export function readNicSavedReference() {
  return savedReference;
}

export function clearNicFormSession() {
  citizenId = null;
  appId = null;
  savedReference = null;
  submitted = false;
  personal = null;
  contact = null;
  files = {};
}

export function rememberNicPersonal(value: NicPersonalSnapshot) {
  personal = value;
}

export function rememberNicContact(value: NicContactSnapshot) {
  contact = value;
}

export function rememberNicFiles(value: Partial<Record<NicDocument['document_key'], NicFileSnapshot>>) {
  files = value;
}

function isoDate(value: string | undefined) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value ?? '');
  if (!match) return undefined;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined;
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function text(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function fileType(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'pdf') return 'application/pdf';
  return 'image/jpeg';
}

async function uploadedDocuments(): Promise<NicDocument[] | undefined> {
  const keys = (['birth', 'address', 'photo', 'previous'] as const).filter((key) => files[key]);
  if (keys.length === 0) return undefined;
  const documents: NicDocument[] = [];
  for (const key of keys) {
    const file = files[key];
    if (!file) continue;
    const stored = await uploadNicDocument({ uri: file.uri, name: file.name, type: fileType(file.name) });
    documents.push({ document_key: key, ...stored });
  }
  return documents;
}

function formData(documents?: NicDocument[]): NicData {
  if (!personal?.fullName.trim()) throw new Error('Enter the applicant’s full name before saving.');
  if (citizenId == null) throw new Error('The citizen record is not ready.');
  const data: NicData = {
    applicant_id: citizenId,
    full_name: personal.fullName.trim(),
    date_of_birth: isoDate(personal.dob),
    gender: personal.gender,
    place_of_birth: text(personal.placeOfBirth),
    district: text(personal.district),
    religion: text(personal.religion),
    occupation: text(personal.occupation),
    permanent_address: text(contact?.permanentAddress),
    current_address: text(contact?.currentAddress),
    same_as_permanent: contact?.sameAsPermanent ?? false,
    phone: text(contact?.phone),
    email: text(contact?.email),
    father_name: text(contact?.fatherName),
    father_nic: text(contact?.fatherNic),
    mother_name: text(contact?.motherName),
    mother_nic: text(contact?.motherNic),
    marital_status: text(contact?.maritalStatus),
    nic_type: files.previous ? 'Renewal' : 'New',
  };
  if (documents) data.documents = documents;
  return data;
}

async function ensureCitizen() {
  const fullName = personal?.fullName.trim();
  if (!fullName) throw new Error('Enter the applicant’s full name before saving.');
  const data = {
    full_name: fullName,
    date_of_birth: isoDate(personal?.dob),
    gender: personal?.gender,
    phone: text(contact?.phone),
    email: text(contact?.email),
    address: text(contact?.permanentAddress) ?? text(contact?.currentAddress),
  };
  if (citizenId == null) {
    const created = await createCitizen(data);
    citizenId = created.citizen_id;
  } else {
    await updateCitizen(citizenId, data);
  }
}

export async function saveNicFormDraft(options?: { includeDocuments?: boolean }) {
  if (submitted) return savedReference;
  await ensureCitizen();
  const documents = options?.includeDocuments ? await uploadedDocuments() : undefined;
  const data = formData(documents);
  if (appId == null) {
    const created = await createNicDraft(data);
    appId = created.app_id;
    savedReference = created.app_ref ?? savedReference;
  } else {
    await updateNic(appId, data);
  }
  return savedReference;
}

export async function submitNicForm(credentials: SignOffCredentials) {
  if (submitted && savedReference) return savedReference;
  await saveNicFormDraft({ includeDocuments: true });
  if (appId == null) throw new Error('The application was not saved.');
  const submittedRow = await submitNic(appId, credentials);
  savedReference = submittedRow.receipt_ref ?? submittedRow.app_ref ?? savedReference;
  submitted = true;
  return savedReference;
}

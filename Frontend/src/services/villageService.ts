import { apiClient } from './apiClient';

// Village officer dashboard. Needs permission CITIZEN_SEARCH.
// NIC applications are created with nicService.* ; the officer's citizens come from citizenService.*

// ── DASHBOARD ──────────────────────────────────────────────────────────────
// GET /api/village/Dashboard
// returns : { recentCertificates: last 10 approved/pending Birth|Death|Marriage records,
//             myPendingNic: { my_pending_nic: number } }
export interface VillageDashboard {
  recentCertificates: {
    app_ref: string;
    category: 'Birth' | 'Death' | 'Marriage';
    name: string;
    status: string;
    created_at: string;
  }[];
  myPendingNic: { my_pending_nic: number } | null;
}
export const getVillageDashboard = () => apiClient.get<VillageDashboard>('/api/village/Dashboard');

export type VillageCertificateCategory = 'Birth' | 'Death' | 'Marriage';

export interface BirthCertificatePreview {
  app_ref: string;
  status: string;
  subject_name: string;
  date_of_birth: string | null;
  time_of_birth: string | null;
  place_of_birth: string | null;
  gender: string | null;
  birth_weight: string | null;
  father_name: string | null;
  mother_name: string | null;
  hospital_name: string | null;
  registration_date: string | null;
}

export interface DeathCertificatePreview {
  app_ref: string;
  status: string;
  subject_name: string;
  deceased_nic: string | null;
  date_of_death: string | null;
  time_of_death: string | null;
  place_of_death: string | null;
  gender: string | null;
  age_at_death: string | null;
  cause_of_death: string | null;
  permanent_address: string | null;
}

export interface MarriageCertificatePreview {
  app_ref: string;
  status: string;
  subject_name: string;
  groom_name: string | null;
  bride_name: string | null;
  marriage_date: string | null;
  marriage_place: string | null;
  marriage_registrar: string | null;
  registration_number: string | null;
}

export type VillageCertificatePreview = BirthCertificatePreview | DeathCertificatePreview | MarriageCertificatePreview;

// GET /api/village/Certificates?category=Birth|Death|Marriage
export const getVillageCertificates = (category: VillageCertificateCategory) =>
  apiClient.get<VillageCertificatePreview[]>('/api/village/Certificates', { category });
import { apiClient } from './apiClient';

// Citizen register. Birth / Death / Marriage / NIC forms use citizen_id as "applicant_id".
// Search needs CITIZEN_SEARCH, create / edit need CITIZEN_MANAGE.

export interface CitizenData {
  full_name: string;
  nic?: string;
  date_of_birth?: string; // yyyy-MM-dd
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
}
export interface CitizenListItem {
  citizen_id: number;
  full_name: string;
  nic: string;
  date_of_birth: string;
  gender: string;
  phone: string | null;
  address: string | null;
}
export interface Citizen extends CitizenListItem {
  email: string | null;
  created_at: string;
  updated_at: string | null;
}

// ── SEARCH (by NIC or part of the name, max 50) ────────────────────────────
// GET /api/citizen/Search?search_value=199012345678
export const searchCitizens = (searchValue: string) =>
  apiClient.get<CitizenListItem[]>('/api/citizen/Search', { search_value: searchValue });

// ── ONE CITIZEN ────────────────────────────────────────────────────────────
// GET /api/citizen/Get?citizen_id=5
export const getCitizenById = (citizenId: number) => apiClient.get<Citizen>('/api/citizen/Get', { citizen_id: citizenId });

// ── CREATE ─────────────────────────────────────────────────────────────────
// POST /api/citizen/Create        body: { data: {...} }        returns { citizen_id }
export const createCitizen = (data: CitizenData) => apiClient.post<{ citizen_id: number }>('/api/citizen/Create', { data });

// ── EDIT ───────────────────────────────────────────────────────────────────
// POST /api/citizen/Update        body: { citizen_id, data: {...} }
export const updateCitizen = (citizenId: number, data: CitizenData) =>
  apiClient.post<{ citizen_id: number }>('/api/citizen/Update', { citizen_id: citizenId, data });
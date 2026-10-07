import { apiClient } from './apiClient';

// Bank officer: identity verification. Needs permission IDENTITY_VERIFY.

// ── VERIFY (NIC number, or an approved application reference like BRT-000012) ──
// GET /api/bank/Verify?search_value=199012345678
export interface BankVerifyResult {
  verification: {
    verification_status: 'Valid' | 'Not Found';
    citizen_id: number | null;
    full_name: string | null;
    nic: string | null;
    date_of_birth: string | null;
    gender: string | null;
  } | null;
  approvedApplications: { category: string; app_ref: string; subject_name: string; created_at: string }[];
  linkedRecords: { record_type: 'Marriage' | 'Death'; app_ref: string; detail: string; record_date: string }[];
}
export const verifyIdentity = (searchValue: string) =>
  apiClient.get<BankVerifyResult>('/api/bank/Verify', { search_value: searchValue });

// ── RECENT VERIFICATIONS (last 10 by me) ───────────────────────────────────
// GET /api/bank/Recent
export const getRecentVerifications = () =>
  apiClient.get<{ created_at: string; description: string }[]>('/api/bank/Recent');
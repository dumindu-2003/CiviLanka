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
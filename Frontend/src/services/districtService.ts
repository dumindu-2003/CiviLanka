import { callAction } from './apiClient';
import { DEMO_MODE } from '../config';
import type { SignOffCredentials } from '../types/auth';
import type { ApplicationItem, Category, DashboardSummary, Decision } from '../types/district';

const ROUTE = 'district';
// These values must match @ActionType in the SQL procedure
const ACTION = {
  SUMMARY: 'SUMMARY',
  LIST: 'LIST',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
} as const;

// ---------- demo data (only used when DEMO_MODE = 1) ----------
const wait = (ms = 250) => new Promise<void>((r) => setTimeout(r, ms));

const demoSummary: DashboardSummary = { pending: 15, approved: 45, rejected: 3, totalRecords: 63 };

const demoApps: ApplicationItem[] = [
  { id: 'APP001', category: 'Birth', applicantName: 'Saman Perera', submittedOn: '2026-09-01', status: 'Pending' },
  { id: 'APP002', category: 'Death', applicantName: 'Nimal Silva', submittedOn: '2026-08-28', status: 'Pending' },
];

export const districtService = {
  getSummary: async (): Promise<DashboardSummary> => {
    if (DEMO_MODE) {
      await wait();
      return { ...demoSummary };
    }
    return callAction<DashboardSummary>(ROUTE, ACTION.SUMMARY);
  },

  getQueue: async (category: Category): Promise<ApplicationItem[]> => {
    if (DEMO_MODE) {
      await wait();
      return demoApps.filter((a) => category === 'All' || a.category === category).map((a) => ({ ...a }));
    }
    return callAction<ApplicationItem[]>(ROUTE, ACTION.LIST, { category });
  },

  decide: async (applicationId: string, decision: Decision, credentials: SignOffCredentials): Promise<null> => {
    if (DEMO_MODE) {
      await wait();
      const app = demoApps.find((a) => a.id === applicationId);
      if (app && app.status === 'Pending') {
        app.status = decision === 'APPROVE' ? 'Approved' : 'Rejected';
        demoSummary.pending -= 1;
        if (decision === 'APPROVE') demoSummary.approved += 1;
        else demoSummary.rejected += 1;
      }
      return null;
    }
    return callAction<null>(ROUTE, decision === 'APPROVE' ? ACTION.APPROVE : ACTION.REJECT, {
      applicationId,
      ...credentials,
    });
  },
};
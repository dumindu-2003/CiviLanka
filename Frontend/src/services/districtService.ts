import { callAction } from './apiClient';
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

export const districtService = {
  getSummary: () => callAction<DashboardSummary>(ROUTE, ACTION.SUMMARY),

  getQueue: (category: Category) => callAction<ApplicationItem[]>(ROUTE, ACTION.LIST, { category }),

  decide: (applicationId: string, decision: Decision, credentials: SignOffCredentials) =>
    callAction<null>(ROUTE, decision === 'APPROVE' ? ACTION.APPROVE : ACTION.REJECT, {
      applicationId,
      ...credentials,
    }),
};

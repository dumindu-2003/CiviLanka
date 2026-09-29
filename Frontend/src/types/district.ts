import type { Status } from '../components/StatusBadge';

export type Category = 'All' | 'Birth' | 'Death' | 'Marriage';
export type Decision = 'APPROVE' | 'REJECT';

export interface DashboardSummary {
  pending: number;
  approved: number;
  rejected: number;
  totalRecords: number;
}

export interface ApplicationItem {
  id: string; // e.g. APP001
  category: Exclude<Category, 'All'>;
  applicantName: string;
  submittedOn: string;
  status: Status;
}

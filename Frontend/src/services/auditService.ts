import { apiClient } from './apiClient';

// Used by: "Audit Trail" button on the District dashboard (screen not built yet).  Needs permission AUDIT_VIEW.

export interface AuditEntry {
  audit_id: number;
  created_at: string;
  action: string; // Create / Update / Verify / Approve ...
  table_name: string;
  record_id: number | null;
  description: string;
  user_id: number;
  officer_name: string | null;
}

// ── AUDIT LIST (latest 500, newest first) ──────────────────────────────────
// GET /api/audit/List?from_date=yyyy-MM-dd&to_date=yyyy-MM-dd&table_name=...&user_id=...   (all filters optional)
export const getAuditList = (filter: { fromDate?: string; toDate?: string; tableName?: string; userId?: number } = {}) =>
  apiClient.get<AuditEntry[]>('/api/audit/List', {
    from_date: filter.fromDate,
    to_date: filter.toDate,
    table_name: filter.tableName,
    user_id: filter.userId,
  });
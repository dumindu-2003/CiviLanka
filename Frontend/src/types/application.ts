// Shared by birthService / deathService / marriageService / nicService
export type AppStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

// one row of  GET /api/{birth|death|marriage|nic}/List
export interface AppListItem {
  app_id: number;
  app_ref: string; // BRT-000012 / DTH-.. / MRG-.. / NIC-..
  name: string; // baby / deceased / "Groom & Bride" / applicant
  status: AppStatus;
  rejection_reason: string | null;
  created_at: string;
}

// GET /api/{birth|death|marriage}/Dashboard
export interface AppDashboard {
  summary: { new_entries: number; pending: number; approved: number };
  recent: { app_id: number; app_ref: string; name: string; status: AppStatus; created_at: string }[];
}

// result of Create / Update / Submit
export interface AppSaveResult {
  app_id: number;
  app_ref?: string;
  status: AppStatus;
}
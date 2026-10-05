import { apiClient } from './apiClient';

export interface ApiHealth {
  api: string;
  database: string;
  server: string;
  timestamp_utc: string;
}

export interface DatabaseHealth {
  database: string;
  server: string;
}

export const getApiHealth = () => apiClient.get<ApiHealth>('/api/health');

export const getDatabaseHealth = () => apiClient.get<DatabaseHealth>('/api/health/database');

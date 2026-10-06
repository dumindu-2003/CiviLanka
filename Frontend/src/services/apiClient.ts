import axios from 'axios';
import { tokenStorage } from './tokenStorage';
import { API_BASE_URL } from '../config';
import type { SignOffCredentials } from '../types/auth';

export { API_BASE_URL }; // profileService uses it for the photo URL

const http = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

// every request carries the JWT (saved by tokenStorage after login)
http.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Backend always answers { StatusCode, Result, ResultSet }.  We return ResultSet, or throw Error(Result).
interface ApiResponse<T> {
  StatusCode: number;
  Result: string | null;
  ResultSet: T;
}

const unwrap = <T>(body: ApiResponse<T>): T => {
  if (body.StatusCode !== 200) throw new Error(body.Result ?? `Request failed (${body.StatusCode})`);
  return body.ResultSet;
};

const toError = (e: any): Error => {
  const d = e?.response?.data;
  const detail = typeof d?.detail === 'string' ? d.detail : undefined; // FastAPI 401 -> { detail }
  if (!e?.response && ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'].includes(e?.code)) {
    return new Error(
      `Cannot reach the CiviLanka API at ${API_BASE_URL}. Confirm the backend is running on port 8000. For an Android phone connected to this PC by USB, run "adb reverse tcp:8000 tcp:8000" and set EXPO_PUBLIC_API_URL=http://127.0.0.1:8000; otherwise use a network-reachable PC address.`,
    );
  }
  return new Error(d?.Result ?? detail ?? e?.message ?? 'Network error');
};

export const apiClient = {
  /** GET  /api/...  params -> ?query string (undefined values are skipped) */
  get: async <T>(url: string, params: object = {}): Promise<T> => {
    try {
      return unwrap((await http.get<ApiResponse<T>>(url, { params })).data);
    } catch (e) {
      throw toError(e);
    }
  },

  /** POST /api/...  body -> JSON */
  post: async <T>(url: string, body: object = {}): Promise<T> => {
    try {
      return unwrap((await http.post<ApiResponse<T>>(url, body)).data);
    } catch (e) {
      throw toError(e);
    }
  },

  /** POST /api/...  multipart/form-data  (file = { uri, name, type }) */
  upload: async <T>(url: string, file: { uri: string; name: string; type: string }): Promise<T> => {
    try {
      const fd = new FormData();
      fd.append('file', file as any);
            const res = await http.post<ApiResponse<T>>(url, fd, {
        timeout: 60000,
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (d) => d,
      });
      return unwrap(res.data);
    } catch (e) {
      throw toError(e);
    }
  },
};

// Sign-off modal fields  ->  backend field names (used by every "authorizing officer" call)
export const toSignoff = (c: SignOffCredentials) => ({
  signoff_username: c.officerUserName,
  signoff_service_number: c.authorizingServiceNo,
  signoff_password: c.officerPassword,
});
import axios from 'axios';
import { tokenStorage } from './tokenStorage';

const http = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:5000', // Android emulator -> PC
  timeout: 15000,
});

http.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response envelope agreed with the ASP.NET developers
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * The ONLY function that talks to the backend.
 * POST /api/{route}   body: { actionType, ...payload }
 * actionType = the @ActionType value inside the SQL procedure
 */
export async function callAction<T>(route: string, actionType: string, payload: object = {}): Promise<T> {
  try {
    const res = await http.post<ApiResponse<T>>(`/api/${route}`, { actionType, ...payload });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message ?? e?.message ?? 'Network error');
  }
}

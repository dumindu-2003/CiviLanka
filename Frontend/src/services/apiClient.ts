import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { tokenStorage } from './tokenStorage';

const API_PORT = '5000';

function apiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (configured) return configured;

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:${API_PORT}`;
  }
  if (Platform.OS === 'android') return `http://10.0.2.2:${API_PORT}`;
  return `http://localhost:${API_PORT}`;
}

const baseURL = apiBaseUrl();

const http = axios.create({
  baseURL,
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
    const serverMessage = e?.response?.data?.message as string | undefined;
    if (serverMessage) throw new Error(serverMessage);
    if (!e?.response) {
      throw new Error(`Cannot reach the server at ${baseURL}. Start the backend on this computer and keep the phone on the same Wi-Fi.`);
    }
    throw new Error(e?.message ?? 'Network error');
  }
}

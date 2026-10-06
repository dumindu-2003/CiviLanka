import { create, isAxiosError } from 'axios';
import { tokenStorage } from './tokenStorage';

const http = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000', // Android emulator -> FastAPI
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

export interface BackendResponse<T> {
  StatusCode: number;
  Result: string | null;
  ResultSet: T | null;
}

export async function requestApi<T>(
  path: string,
  method: 'GET' | 'POST',
  data?: object,
  params?: object,
): Promise<T> {
  try {
    const response = await http.request<BackendResponse<T>>({
      url: `/api/${path}`,
      method,
      data,
      params,
    });
    const body = response.data;

    if (body.StatusCode < 200 || body.StatusCode >= 300) {
      throw new Error(body.Result ?? 'The server rejected the request.');
    }

    return body.ResultSet as T;
  } catch (error) {
    if (isAxiosError<BackendResponse<unknown>>(error)) {
      throw new Error(
        error.response?.data?.Result ??
          error.message ??
          'Unable to connect to the server.',
      );
    }

    throw error;
  }
}

/**
 * Legacy action endpoint used by existing modules.
 * POST /api/{route}   body: { actionType, ...payload }
 * actionType = the @ActionType value inside the SQL procedure
 */
export async function callAction<T>(route: string, actionType: string, payload: object = {}): Promise<T> {
  try {
    const res = await http.post<ApiResponse<T>>(`/api/${route}`, { actionType, ...payload });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data;
  } catch (error) {
    if (isAxiosError<BackendResponse<unknown>>(error)) {
      throw new Error(
        error.response?.data?.Result ?? error.message ?? 'Network error',
      );
    }
    throw error;
  }
}

import { callAction } from './apiClient';
import type { LoginPayload, LoginResult } from '../types/auth';

const ROUTE = 'auth';
const ACTION = { LOGIN: 'LOGIN' } as const;

export const authService = {
  login: (p: LoginPayload) => callAction<LoginResult>(ROUTE, ACTION.LOGIN, p),
};

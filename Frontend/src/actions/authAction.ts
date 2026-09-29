import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import { tokenStorage } from '../services/tokenStorage';
import type { LoginPayload } from '../types/auth';

export const login = createAsyncThunk('auth/login', async (payload: LoginPayload) => {
  const result = await authService.login(payload);
  await tokenStorage.set(result.token);
  return result;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await tokenStorage.clear();
});

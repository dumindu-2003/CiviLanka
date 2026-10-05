import { createSlice } from '@reduxjs/toolkit';
import { login, logout } from '../actions/authAction';
import type { AuthUser } from '../types/auth';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  homeScreen: string | null;
  allowedScreens: string[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  homeScreen: null,
  allowedScreens: [],
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.status = 'idle';
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.homeScreen = a.payload.homeScreen;
        s.allowedScreens = a.payload.allowedScreens;
      })
      .addCase(login.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.error.message ?? 'Login failed';
      })
      .addCase(logout.fulfilled, () => initialState);
  },
});

export default authSlice.reducer;
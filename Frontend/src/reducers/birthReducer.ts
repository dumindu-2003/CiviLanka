import { createSlice } from '@reduxjs/toolkit';
import {
  createBirthApplication,
  getBirthApplication,
  loadBirthApplications,
  submitBirthApplication,
  updateBirthApplication,
} from '../actions/birthAction';
import type { BirthApplication } from '../types/birth';

interface BirthState {
  queue: BirthApplication[];
  selected: BirthApplication | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: BirthState = {
  queue: [],
  selected: null,
  status: 'idle',
  error: null,
};

const birthSlice = createSlice({
  name: 'birth',
  initialState,
  reducers: {
    clearSelectedBirth(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadBirthApplications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadBirthApplications.fulfilled, (state, action) => {
        state.status = 'idle';
        state.queue = action.payload;
      })
      .addCase(loadBirthApplications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load birth applications.';
      })
      .addCase(getBirthApplication.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getBirthApplication.fulfilled, (state, action) => {
        state.status = 'idle';
        state.selected = action.payload;
      })
      .addCase(getBirthApplication.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load the birth application.';
      })
      .addCase(createBirthApplication.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createBirthApplication.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(createBirthApplication.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to create the birth application.';
      })
      .addCase(updateBirthApplication.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateBirthApplication.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(updateBirthApplication.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to update the birth application.';
      })
      .addCase(submitBirthApplication.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(submitBirthApplication.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(submitBirthApplication.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to submit the birth application.';
      });
  },
});

export const { clearSelectedBirth } = birthSlice.actions;
export default birthSlice.reducer;

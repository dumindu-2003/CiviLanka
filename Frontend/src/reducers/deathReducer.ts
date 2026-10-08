import { createSlice } from '@reduxjs/toolkit';
import {
  createDeathApplication,
  getDeathApplication,
  loadDeathApplications,
  submitDeathApplication,
  updateDeathApplication,
} from '../actions/deathAction';
import type { DeathApplication } from '../types/death';

interface DeathState {
  queue: DeathApplication[];
  selected: DeathApplication | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: DeathState = {
  queue: [],
  selected: null,
  status: 'idle',
  error: null,
};

const deathSlice = createSlice({
  name: 'death',
  initialState,
  reducers: {
    clearSelectedDeath(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDeathApplications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadDeathApplications.fulfilled, (state, action) => {
        state.status = 'idle';
        state.queue = action.payload;
      })
      .addCase(loadDeathApplications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load death applications.';
      })
      .addCase(getDeathApplication.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getDeathApplication.fulfilled, (state, action) => {
        state.status = 'idle';
        state.selected = action.payload;
      })
      .addCase(getDeathApplication.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load the death application.';
      })
      .addCase(createDeathApplication.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createDeathApplication.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(createDeathApplication.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to create the death application.';
      })
      .addCase(updateDeathApplication.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateDeathApplication.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(updateDeathApplication.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to update the death application.';
      })
      .addCase(submitDeathApplication.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(submitDeathApplication.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(submitDeathApplication.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to submit the death application.';
      });
  },
});

export const { clearSelectedDeath } = deathSlice.actions;
export default deathSlice.reducer;

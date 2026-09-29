import { createSlice } from '@reduxjs/toolkit';
import { decideApplication, loadDashboard } from '../actions/districtAction';
import type { ApplicationItem, Category, DashboardSummary } from '../types/district';

interface DistrictState {
  summary: DashboardSummary | null;
  queue: ApplicationItem[];
  category: Category;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: DistrictState = {
  summary: null,
  queue: [],
  category: 'All',
  status: 'idle',
  error: null,
};

const districtSlice = createSlice({
  name: 'district',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboard.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(loadDashboard.fulfilled, (s, a) => {
        s.status = 'idle';
        s.summary = a.payload.summary;
        s.queue = a.payload.queue;
        s.category = a.payload.category;
      })
      .addCase(loadDashboard.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.error.message ?? 'Failed to load';
      })
      .addCase(decideApplication.rejected, (s, a) => {
        s.error = a.error.message ?? 'Action failed';
      });
  },
});

export default districtSlice.reducer;

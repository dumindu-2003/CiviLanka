import { createAsyncThunk } from '@reduxjs/toolkit';
import { districtService } from '../services/districtService';
import type { SignOffCredentials } from '../types/auth';
import type { Category, Decision } from '../types/district';

export const loadDashboard = createAsyncThunk('district/loadDashboard', async (category: Category) => {
  const [summary, queue] = await Promise.all([
    districtService.getSummary(),
    districtService.getQueue(category),
  ]);
  return { summary, queue, category };
});

export const decideApplication = createAsyncThunk(
  'district/decideApplication',
  async (
    arg: { id: string; decision: Decision; credentials: SignOffCredentials },
    { dispatch, getState },
  ) => {
    await districtService.decide(arg.id, arg.decision, arg.credentials);
    // Inline state shape (not RootState) avoids a circular type reference with the store
    const { category } = (getState() as { district: { category: Category } }).district;
    await dispatch(loadDashboard(category)); // refresh tiles + queue
  },
);

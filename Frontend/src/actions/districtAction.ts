import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  approveApplication,
  getDistrictQueue,
  getDistrictSummary,
  rejectApplication,
} from '../services/districtService';
import type { SignOffCredentials } from '../types/auth';
import type { Category, Decision } from '../types/district';

export const loadDashboard = createAsyncThunk('district/loadDashboard', async (category: Category) => {
  const [summary, queue] = await Promise.all([getDistrictSummary(), getDistrictQueue(category)]);
  return { summary, queue, category };
});

export const decideApplication = createAsyncThunk(
  'district/decideApplication',
  async (
    arg: { id: string; decision: Decision; credentials: SignOffCredentials; reason?: string },
    { dispatch, getState },
  ) => {
    if (arg.decision === 'APPROVE') await approveApplication(arg.id, arg.credentials);
    else await rejectApplication(arg.id, arg.reason ?? '', arg.credentials); // reject needs a reason
    // Inline state shape (not RootState) avoids a circular type reference with the store
    const { category } = (getState() as { district: { category: Category } }).district;
    await dispatch(loadDashboard(category)); // refresh tiles + queue
  },
);
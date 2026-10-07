import { createAsyncThunk } from '@reduxjs/toolkit';
import { birthService } from '../services/birthService';
import type { SignOffCredentials } from '../types/auth';
import type { BirthApplicationPayload } from '../types/birth';

export const loadBirthApplications = createAsyncThunk(
  'birth/loadApplications',
  () => birthService.getQueue(),
);

export const getBirthApplication = createAsyncThunk(
  'birth/getApplication',
  (id: string) => birthService.get(id),
);

export const createBirthApplication = createAsyncThunk(
  'birth/createApplication',
  (arg: {
    payload: BirthApplicationPayload;
    status: 'Draft' | 'Pending';
    credentials?: SignOffCredentials;
  }) => birthService.create(arg.payload, arg.status, arg.credentials),
);

export const updateBirthApplication = createAsyncThunk(
  'birth/updateApplication',
  (arg: { id: string; payload: BirthApplicationPayload }) =>
    birthService.update(arg.id, arg.payload),
);

export const submitBirthApplication = createAsyncThunk(
  'birth/submitApplication',
  (arg: { id: string; credentials: SignOffCredentials }) =>
    birthService.submit(arg.id, arg.credentials),
);

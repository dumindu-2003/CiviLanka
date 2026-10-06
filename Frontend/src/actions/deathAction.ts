import { createAsyncThunk } from '@reduxjs/toolkit';
import { deathService } from '../services/deathService';
import type { SignOffCredentials } from '../types/auth';
import type { DeathApplicationPayload, DeathStatus } from '../types/death';

export const loadDeathApplications = createAsyncThunk(
  'death/loadApplications',
  () => deathService.getQueue(),
);

export const getDeathApplication = createAsyncThunk(
  'death/getApplication',
  (id: string) => deathService.get(id),
);

export const createDeathApplication = createAsyncThunk(
  'death/createApplication',
  (arg: {
    payload: DeathApplicationPayload;
    status: 'Draft' | 'Pending';
    credentials?: SignOffCredentials;
  }) => deathService.create(arg.payload, arg.status, arg.credentials),
);

export const updateDeathApplication = createAsyncThunk(
  'death/updateApplication',
  (arg: { id: string; payload: DeathApplicationPayload; status: DeathStatus }) =>
    deathService.update(arg.id, arg.payload, arg.status),
);

export const submitDeathApplication = createAsyncThunk(
  'death/submitApplication',
  (arg: { id: string; credentials: SignOffCredentials }) =>
    deathService.submit(arg.id, arg.credentials),
);

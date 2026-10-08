import { createAsyncThunk } from '@reduxjs/toolkit';
import { createMarriageDraft, updateMarriage } from '../services/marriageService';
import type { MarriageForm } from '../types/marriage';
import { invalidDates, toMarriageData } from '../utils/marriageForm';

// Create the draft the first time, update the same record after that
export const saveMarriageDraft = createAsyncThunk('marriage/saveDraft', async (_: void, { getState }) => {
  // Inline state shape (not RootState) avoids a circular type reference with the store
  const { form, appId } = (getState() as { marriage: { form: MarriageForm; appId: number | null } }).marriage;
  if (!form.applicant) throw new Error('Select the applicant (citizen) first.');
  const badDates = invalidDates(form);
  if (badDates.length) throw new Error(`Use DD/MM/YYYY for: ${badDates.join(', ')}.`);

  const data = toMarriageData(form, form.applicant.citizenId);
  return appId ? updateMarriage(appId, data) : createMarriageDraft(data);
});

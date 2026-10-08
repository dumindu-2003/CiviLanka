import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { saveMarriageDraft } from '../actions/marriageAction';
import type { MarriageApplicant, MarriageForm, MarriagePerson, Solemnization } from '../types/marriage';
import { emptyMarriageForm } from '../utils/marriageForm';

interface MarriageState {
  form: MarriageForm;
  appId: number | null; // set after the first draft save
  appRef: string | null;
  status: 'idle' | 'saving' | 'saved' | 'failed';
  error: string | null;
}

const initialState: MarriageState = {
  form: emptyMarriageForm(),
  appId: null,
  appRef: null,
  status: 'idle',
  error: null,
};

type Patch<T> = { [K in keyof T]: { key: K; value: T[K] } }[keyof T];

const copyApplicantToGroom = (form: MarriageForm) => {
  if (!form.applicantIsGroom || !form.applicant) return;
  const { fullName, nic, dob, address } = form.applicant;
  form.groom = { ...form.groom, fullName, nic, dob, address };
};

const marriageSlice = createSlice({
  name: 'marriage',
  initialState,
  reducers: {
    resetDraft: () => ({ ...initialState, form: emptyMarriageForm() }),
    setApplicant: (s, a: PayloadAction<MarriageApplicant | null>) => {
      s.form.applicant = a.payload;
      copyApplicantToGroom(s.form);
    },
    setApplicantIsGroom: (s, a: PayloadAction<boolean>) => {
      s.form.applicantIsGroom = a.payload;
      copyApplicantToGroom(s.form);
    },
    patchGroom: (s, a: PayloadAction<Patch<MarriagePerson>>) => {
      (s.form.groom as any)[a.payload.key] = a.payload.value;
    },
    patchBride: (s, a: PayloadAction<Patch<MarriagePerson>>) => {
      (s.form.bride as any)[a.payload.key] = a.payload.value;
    },
    patchSolemnization: (s, a: PayloadAction<Patch<Solemnization>>) => {
      s.form.solemnization[a.payload.key] = a.payload.value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveMarriageDraft.pending, (s) => {
        s.status = 'saving';
        s.error = null;
      })
      .addCase(saveMarriageDraft.fulfilled, (s, a) => {
        s.status = 'saved';
        s.appId = a.payload.app_id;
        s.appRef = a.payload.app_ref ?? s.appRef;
      })
      .addCase(saveMarriageDraft.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.error.message ?? 'Could not save the draft';
      });
  },
});

export const { resetDraft, setApplicant, setApplicantIsGroom, patchGroom, patchBride, patchSolemnization } =
  marriageSlice.actions;
export default marriageSlice.reducer;

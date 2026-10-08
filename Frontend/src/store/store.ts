import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../reducers/authReducer';
import districtReducer from '../reducers/districtReducer';
import birthReducer from '../reducers/birthReducer';
import deathReducer from '../reducers/deathReducer';
import marriageReducer from '../reducers/marriageReducer';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    district: districtReducer,
    birth: birthReducer,
    death: deathReducer,
    marriage: marriageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

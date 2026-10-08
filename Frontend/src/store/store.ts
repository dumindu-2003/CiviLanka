import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../reducers/authReducer';
import districtReducer from '../reducers/districtReducer';
import birthReducer from '../reducers/birthReducer';
import deathReducer from '../reducers/deathReducer';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    district: districtReducer,
    birth: birthReducer,
    death: deathReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
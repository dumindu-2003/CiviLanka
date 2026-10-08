import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../reducers/authReducer';
import districtReducer from '../reducers/districtReducer';
import marriageReducer from '../reducers/marriageReducer';
// Other developers: add your reducer here (one line)

export const store = configureStore({
  reducer: {
    auth: authReducer,
    district: districtReducer,
    marriage: marriageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
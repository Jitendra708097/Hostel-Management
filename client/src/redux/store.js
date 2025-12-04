import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlicer';

// Configure and create the Redux store with the auth reducer 
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
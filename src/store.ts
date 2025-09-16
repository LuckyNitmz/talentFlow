import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from '@/features/jobs/jobsSlice';
import candidatesReducer from '@/features/candidates/candidatesSlice';
import assessmentsReducer from '@/features/assessments/assessmentsSlice';

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    candidates: candidatesReducer,
    assessments: assessmentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

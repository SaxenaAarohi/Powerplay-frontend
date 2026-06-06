import { configureStore } from '@reduxjs/toolkit';
import invoices from '@/features/invoices/invoicesSlice';
import customers from '@/features/customers/customersSlice';
import customerProfile from '@/features/customers/customerProfileSlice';
import summary from '@/features/summary/summarySlice';

export const store = configureStore({
  reducer: {
    invoices,
    customers,
    customerProfile,
    summary,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiError } from '@/lib/http';
import { customerService } from '@/services/customerService';
import type { CustomerProfile } from '@/types/invoice';
import type { RequestStatus } from '@/app/hooks';

interface CustomerProfileState {
  data: CustomerProfile | null;
  status: RequestStatus;
  error: string | null;
}

const initialState: CustomerProfileState = { data: null, status: 'idle', error: null };

export const fetchCustomerProfile = createAsyncThunk<CustomerProfile, string, { rejectValue: string }>(
  'customerProfile/fetch',
  async (id, { rejectWithValue }) => {
    try {
      return await customerService.profile(id);
    } catch (e) {
      return rejectWithValue(e instanceof ApiError ? e.message : 'Failed to load customer');
    }
  },
);

const customerProfileSlice = createSlice({
  name: 'customerProfile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchCustomerProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load customer';
      });
  },
});

export default customerProfileSlice.reducer;

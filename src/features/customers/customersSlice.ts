import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiError } from '@/lib/http';
import { customerService } from '@/services/customerService';
import type { Customer } from '@/types/invoice';
import type { RootState } from '@/app/store';
import type { RequestStatus } from '@/app/hooks';

interface CustomersState {
  items: Customer[];
  status: RequestStatus;
  error: string | null;
}

const initialState: CustomersState = { items: [], status: 'idle', error: null };

export const fetchCustomers = createAsyncThunk<
  Customer[],
  string | undefined,
  { state: RootState; rejectValue: string }
>(
  'customers/fetch',
  async (search, { rejectWithValue }) => {
    try {
      const res = await customerService.list(search);
      return res.data;
    } catch (e) {
      return rejectWithValue(e instanceof ApiError ? e.message : 'Failed to load customers');
    }
  },
  {
    condition: (_arg, { getState }) => {
      const { status } = getState().customers;
      return status === 'idle' || status === 'failed';
    },
  },
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load customers';
      });
  },
});

export default customersSlice.reducer;

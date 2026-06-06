import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiError } from '@/lib/http';
import { summaryService } from '@/services/summaryService';
import type { Summary } from '@/types/invoice';
import type { RequestStatus } from '@/app/hooks';

interface SummaryState {
  data: Summary | null;
  status: RequestStatus;
  error: string | null;
}

const initialState: SummaryState = { data: null, status: 'idle', error: null };

export const fetchSummary = createAsyncThunk<Summary, void, { rejectValue: string }>(
  'summary/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await summaryService.get();
    } catch (e) {
      return rejectWithValue(e instanceof ApiError ? e.message : 'Failed to load summary');
    }
  },
);

const summarySlice = createSlice({
  name: 'summary',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummary.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load summary';
      });
  },
});

export default summarySlice.reducer;

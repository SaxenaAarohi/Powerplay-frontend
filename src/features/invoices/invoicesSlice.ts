import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiError } from '@/lib/http';
import { invoiceService } from '@/services/invoiceService';
import type { Invoice, InvoiceListParams, InvoicePayload, PaginatedInvoices, Pagination } from '@/types/invoice';
import type { RequestStatus } from '@/app/hooks';

interface InvoicesState {
  items: Invoice[];
  pagination: Pagination | null;
  status: RequestStatus;
  error: string | null;
}

const initialState: InvoicesState = {
  items: [],
  pagination: null,
  status: 'idle',
  error: null,
};

const message = (e: unknown, fallback: string) =>
  e instanceof ApiError ? e.message : e instanceof Error ? e.message : fallback;

export const fetchInvoices = createAsyncThunk<PaginatedInvoices, InvoiceListParams, { rejectValue: string }>(
  'invoices/fetch',
  async (params, { rejectWithValue }) => {
    try {
      return await invoiceService.list(params);
    } catch (e) {
      return rejectWithValue(message(e, 'Failed to load invoices'));
    }
  },
);

export const createInvoice = createAsyncThunk<Invoice, InvoicePayload, { rejectValue: string }>(
  'invoices/create',
  async (body, { rejectWithValue }) => {
    try {
      return await invoiceService.create(body);
    } catch (e) {
      return rejectWithValue(message(e, 'Failed to create invoice'));
    }
  },
);

export const updateInvoice = createAsyncThunk<
  Invoice,
  { id: string; body: Partial<InvoicePayload> },
  { rejectValue: string }
>('invoices/update', async ({ id, body }, { rejectWithValue }) => {
  try {
    return await invoiceService.update(id, body);
  } catch (e) {
    return rejectWithValue(message(e, 'Failed to update invoice'));
  }
});

export const deleteInvoice = createAsyncThunk<string, string, { rejectValue: string }>(
  'invoices/delete',
  async (id, { rejectWithValue }) => {
    try {
      await invoiceService.remove(id);
      return id;
    } catch (e) {
      return rejectWithValue(message(e, 'Failed to delete invoice'));
    }
  },
);

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load invoices';
      });

  },
});

export default invoicesSlice.reducer;

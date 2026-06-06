import { http } from '@/lib/http';
import type { Invoice, InvoiceListParams, InvoicePayload, PaginatedInvoices } from '@/types/invoice';

export const invoiceService = {
  list: (params: InvoiceListParams) =>
    http.get<PaginatedInvoices>('/invoices', params as Record<string, unknown>),
  get: (id: string) => http.get<Invoice>(`/invoices/${id}`),
  create: (body: InvoicePayload) => http.post<Invoice>('/invoices', body),
  update: (id: string, body: Partial<InvoicePayload>) => http.patch<Invoice>(`/invoices/${id}`, body),
  remove: (id: string) => http.delete<void>(`/invoices/${id}`),
};

export const INVOICE_STATUSES = ['Draft', 'Sent', 'Unpaid', 'Overdue', 'Paid', 'Void'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const TAX_RATES = [0, 3, 5, 18, 28] as const;
export type TaxRate = (typeof TAX_RATES)[number];

export interface Invoice {
  _id: string;
  invoiceId: string;
  customerId: string;
  customerName: string;
  amount: number;
  taxRate: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  company: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedInvoices {
  data: Invoice[];
  pagination: Pagination;
}

export interface CustomerProfile {
  customer: Customer;
  metrics: {
    totalBilled: number;
    totalTax: number;
    outstanding: number;
    invoiceCount: number;
  };
  statusBreakdown: Partial<Record<InvoiceStatus, number>>;
  invoices: Invoice[];
}

export interface TopCustomer {
  customerId: string;
  name: string;
  company: string;
  totalValue: number;
  invoiceCount: number;
}

export interface StatusBreakdownEntry {
  status: InvoiceStatus;
  count: number;
  value: number;
}

export interface MonthlyRevenueEntry {
  month: string;
  total: number;
  count: number;
}

export interface Summary {
  totalBilled: number;
  totalTax: number;
  invoiceCount: number;
  customerCount: number;
  topCustomers: TopCustomer[];
  statusBreakdown: StatusBreakdownEntry[];
  monthlyRevenue: MonthlyRevenueEntry[];
}

export interface InvoiceListParams {
  page?: number;
  limit?: number;
  sort?: 'amount' | 'total' | 'dueDate' | 'issueDate' | 'createdAt';
  order?: 'asc' | 'desc';
  search?: string;
  status?: InvoiceStatus;
  customerId?: string;
  taxRate?: number;
  issueDateFrom?: string;
  issueDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface InvoicePayload {
  invoiceId?: string;
  customerId: string;
  amount: number;
  taxRate: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
}

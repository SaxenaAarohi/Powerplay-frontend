import { z } from 'zod';
import { INVOICE_STATUSES, TAX_RATES } from '@/types/invoice';

export const invoiceFormSchema = z
  .object({
    customerId: z.string().min(1, 'Please select a customer'),
    amount: z.coerce
      .number({ invalid_type_error: 'Amount is required' })
      .nonnegative('Amount cannot be negative')
      .max(1_000_000_000, 'Amount is too large'),
    taxRate: z.coerce.number().refine((v) => TAX_RATES.includes(v as never), 'Select a valid tax rate'),
    status: z.enum(INVOICE_STATUSES),
    issueDate: z.string().min(1, 'Issue date is required'),
    dueDate: z.string().min(1, 'Due date is required'),
  })
  .refine((d) => d.dueDate >= d.issueDate, {
    message: 'Due date cannot be before the issue date',
    path: ['dueDate'],
  });

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

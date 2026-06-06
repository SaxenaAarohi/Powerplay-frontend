import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch } from '@/app/hooks';
import { useCustomers } from '@/features/customers/useCustomers';
import { createInvoice, updateInvoice } from './invoicesSlice';
import { computeTotals } from '@/lib/money';
import { formatCurrency } from '@/lib/format';
import { INVOICE_STATUSES, TAX_RATES, type Invoice } from '@/types/invoice';
import { invoiceFormSchema, type InvoiceFormValues } from './invoiceForm.schema';

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
    invoice?: Invoice | null;
    onSuccess?: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const toFormValues = (invoice?: Invoice | null): InvoiceFormValues => ({
  customerId: invoice?.customerId ?? '',
  amount: invoice?.amount ?? 0,
  taxRate: invoice?.taxRate ?? 18,
  status: invoice?.status ?? 'Draft',
  issueDate: invoice?.issueDate?.slice(0, 10) ?? today(),
  dueDate: invoice?.dueDate?.slice(0, 10) ?? today(),
});

export function InvoiceFormDialog({ open, onOpenChange, invoice, onSuccess }: InvoiceFormDialogProps) {
  const isEdit = Boolean(invoice);
  const dispatch = useAppDispatch();
  const { customers } = useCustomers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: toFormValues(invoice),
  });

  useEffect(() => {
    if (open) reset(toFormValues(invoice));
  }, [open, invoice, reset]);

  const customerId = watch('customerId');
  const amount = watch('amount');
  const taxRate = watch('taxRate');

  const selectedCompany = useMemo(
    () => customers.find((c) => c._id === customerId)?.company ?? '',
    [customers, customerId],
  );

  const { tax, total } = computeTotals(Number(amount) || 0, Number(taxRate) || 0);

  const onSubmit = async (values: InvoiceFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEdit && invoice) {
        await dispatch(updateInvoice({ id: invoice._id, body: values })).unwrap();
        toast.success('Invoice updated');
      } else {
        await dispatch(createInvoice(values)).unwrap();
        toast.success('Invoice created');
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {

      toast.error(typeof err === 'string' ? err : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit invoice' : 'New invoice'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the invoice details below.' : 'Fill in the details to create a new invoice.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer" error={errors.customerId?.message} htmlFor="customerId">
              <Select value={customerId} onValueChange={(v) => setValue('customerId', v, { shouldValidate: true })}>
                <SelectTrigger id="customerId">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Company (auto-filled)" htmlFor="company">
              <Input id="company" value={selectedCompany} readOnly placeholder="—" className="bg-muted/50" />
            </Field>
          </div>

          {}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount" error={errors.amount?.message} htmlFor="amount">
              <Input id="amount" type="number" step="0.01" min="0" placeholder="0.00" {...register('amount')} />
            </Field>

            <Field label="Tax rate" error={errors.taxRate?.message} htmlFor="taxRate">
              <Select
                value={String(taxRate)}
                onValueChange={(v) => setValue('taxRate', Number(v) as InvoiceFormValues['taxRate'], { shouldValidate: true })}
              >
                <SelectTrigger id="taxRate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAX_RATES.map((rate) => (
                    <SelectItem key={rate} value={String(rate)}>
                      {rate}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Issue date" error={errors.issueDate?.message} htmlFor="issueDate">
              <Input id="issueDate" type="date" {...register('issueDate')} />
            </Field>
            <Field label="Due date" error={errors.dueDate?.message} htmlFor="dueDate">
              <Input id="dueDate" type="date" {...register('dueDate')} />
            </Field>
          </div>

          {}
          <Field label="Status" error={errors.status?.message} htmlFor="status">
            <Select
              value={watch('status')}
              onValueChange={(v) => setValue('status', v as InvoiceFormValues['status'], { shouldValidate: true })}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVOICE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {}
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Tax <span className="font-medium text-foreground">{formatCurrency(tax)}</span>
            </span>
            <span className="text-muted-foreground">
              Total <span className="text-base font-semibold text-foreground">{formatCurrency(total)}</span>
            </span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Save changes' : 'Save invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

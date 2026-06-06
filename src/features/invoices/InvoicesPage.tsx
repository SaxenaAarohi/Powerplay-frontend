import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FileText, IndianRupee, Plus, Receipt, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchSummary } from '@/features/summary/summarySlice';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { Invoice, InvoiceListParams } from '@/types/invoice';
import { InvoiceFilters } from './InvoiceFilters';
import { InvoiceTable, type SortField } from './InvoiceTable';
import { InvoiceFormDialog } from './InvoiceFormDialog';
import { useInvoiceFilters } from './useInvoiceFilters';
import { deleteInvoice, fetchInvoices } from './invoicesSlice';

const PAGE_SIZE = 20;

export default function InvoicesPage() {
  const dispatch = useAppDispatch();

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortField>('dueDate');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const { filters, setFilter, reset, activeCount } = useInvoiceFilters(() => setPage(1));
  const debouncedSearch = useDebouncedValue(filters.search, 350);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { items, pagination, status, error } = useAppSelector((s) => s.invoices);
  const summary = useAppSelector((s) => s.summary.data);
  const summaryLoading = useAppSelector((s) => s.summary.status === 'loading' && !s.summary.data);

  const params = useMemo<InvoiceListParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      sort,
      order,
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      customerId: filters.customerId || undefined,
      taxRate: filters.taxRate ? Number(filters.taxRate) : undefined,
      issueDateFrom: filters.issueDateFrom || undefined,
      issueDateTo: filters.issueDateTo || undefined,
      dueDateFrom: filters.dueDateFrom || undefined,
      dueDateTo: filters.dueDateTo || undefined,
    }),
    [page, sort, order, debouncedSearch, filters],
  );

  useEffect(() => {
    dispatch(fetchInvoices(params));
  }, [dispatch, params]);

  useEffect(() => {
    dispatch(fetchSummary());
  }, [dispatch]);

  const reload = useCallback(() => {
    dispatch(fetchInvoices(params));
    dispatch(fetchSummary());
  }, [dispatch, params]);

  const handleSort = (field: SortField) => {
    if (field === sort) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(field);
      setOrder('desc');
    }
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (invoice: Invoice) => {
    setEditing(invoice);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteInvoice(deleting._id)).unwrap();
      toast.success(`Invoice ${deleting.invoiceId} deleted`);
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to delete invoice');
    } finally {
      setIsDeleting(false);
    }
  };

  const isLoading = status === 'loading' && items.length === 0;
  const isFetching = status === 'loading';
  const isError = status === 'failed';
  const showEmpty = status === 'succeeded' && items.length === 0;

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">Manage, filter, and track all invoices.</p>
        </div>
        <Button onClick={openCreate} className="shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> New invoice
        </Button>
      </div>

      {}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard index={0} label="Total billed" value={summary?.totalBilled ?? 0} format={formatCurrency} icon={IndianRupee} accent="violet" loading={summaryLoading} />
        <StatCard index={1} label="Total tax" value={summary?.totalTax ?? 0} format={formatCurrency} icon={TrendingUp} accent="emerald" loading={summaryLoading} />
        <StatCard index={2} label="Invoices" value={summary?.invoiceCount ?? 0} format={formatNumber} icon={Receipt} accent="sky" loading={summaryLoading} />
        <StatCard index={3} label="Customers" value={summary?.customerCount ?? 0} format={formatNumber} icon={Users} accent="amber" loading={summaryLoading} />
      </div>

      <InvoiceFilters filters={filters} onChange={setFilter} onReset={reset} activeCount={activeCount} />

      <Card className="overflow-hidden">
        {isError ? (
          <ErrorState message={error ?? undefined} onRetry={reload} />
        ) : isLoading ? (
          <TableSkeleton />
        ) : showEmpty ? (
          <EmptyState
            icon={FileText}
            title="No invoices found"
            description={activeCount > 0 ? 'Try adjusting or clearing your filters.' : 'Create your first invoice to get started.'}
            action={
              activeCount > 0 ? (
                <Button variant="outline" size="sm" onClick={reset}>
                  Clear filters
                </Button>
              ) : (
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4" /> New invoice
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className={`h-0.5 ${isFetching ? 'animate-pulse bg-primary/40' : 'bg-transparent'}`} />
            <InvoiceTable
              invoices={items}
              sort={sort}
              order={order}
              onSort={handleSort}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
            {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
          </>
        )}
      </Card>

      <InvoiceFormDialog open={formOpen} onOpenChange={setFormOpen} invoice={editing} onSuccess={reload} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete invoice?"
        description={`This will permanently delete invoice ${deleting?.invoiceId}. This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  );
}

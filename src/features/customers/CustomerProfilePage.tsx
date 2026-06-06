import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, IndianRupee, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { StatusDonut, type StatusDatum } from '@/components/charts/StatusDonut';
import { STATUS_COLORS } from '@/components/charts/chartTheme';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchCustomerProfile } from './customerProfileSlice';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { INVOICE_STATUSES } from '@/types/invoice';

export default function CustomerProfilePage() {
  const { id = '' } = useParams();
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector((s) => s.customerProfile);

  useEffect(() => {
    if (id) dispatch(fetchCustomerProfile(id));
  }, [id, dispatch]);

  const isLoading = status === 'loading' || data?.customer._id !== id;
  const isError = status === 'failed';

  const donutData = useMemo<StatusDatum[]>(
    () => INVOICE_STATUSES.map((s) => ({ status: s, count: data?.statusBreakdown[s] ?? 0 })),
    [data],
  );

  if (isError) {
    return (
      <Card>
        <ErrorState message={error ?? 'Could not load this customer.'} onRetry={() => id && dispatch(fetchCustomerProfile(id))} />
      </Card>
    );
  }

  const initials = data?.customer.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit text-muted-foreground">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" /> Back to invoices
        </Link>
      </Button>

      {}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        {isLoading ? (
          <Skeleton className="h-16 w-16 rounded-2xl" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-xl font-bold text-white shadow-lg shadow-primary/25">
            {initials}
          </div>
        )}
        <div className="space-y-1">
          {isLoading ? (
            <>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">{data?.customer.name}</h1>
              <p className="text-sm text-muted-foreground">
                {data?.customer.company} <span className="ml-1 text-xs opacity-70">· 1 company per customer</span>
              </p>
            </>
          )}
        </div>
      </motion.div>

      {}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total billed" value={data?.metrics.totalBilled ?? 0} format={formatCurrency} icon={IndianRupee} accent="violet" loading={isLoading} />
        <StatCard index={1} label="Total tax" value={data?.metrics.totalTax ?? 0} format={formatCurrency} icon={TrendingUp} accent="emerald" loading={isLoading} />
        <StatCard index={2} label="Outstanding" value={data?.metrics.outstanding ?? 0} format={formatCurrency} icon={Wallet} accent="rose" loading={isLoading} />
        <StatCard index={3} label="Invoices" value={data?.metrics.invoiceCount ?? 0} format={formatNumber} icon={Receipt} accent="sky" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Status mix</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="mx-auto h-56 w-56 rounded-full" />
            ) : data ? (
              <>
                <StatusDonut data={donutData} total={data.metrics.invoiceCount} />
                <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {donutData
                    .filter((s) => s.count > 0)
                    .map((s) => (
                      <li key={s.status} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[s.status] }} />
                        <span className="text-muted-foreground">{s.status}</span>
                        <span className="ml-auto font-medium tabular-nums">{s.count}</span>
                      </li>
                    ))}
                </ul>
              </>
            ) : null}
          </CardContent>
        </Card>

        {}
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader>
            <CardTitle>Invoice history</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data && data.invoices.length > 0 ? (
              <div className="max-h-[28rem] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Invoice</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.invoices.map((inv) => (
                      <TableRow key={inv._id}>
                        <TableCell className="font-medium">{inv.invoiceId}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{formatCurrency(inv.total)}</TableCell>
                        <TableCell>
                          <StatusBadge status={inv.status} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(inv.issueDate)}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState title="No invoices" description="This customer has no invoices yet." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, IndianRupee, Receipt, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/shared/StatCard';
import { ErrorState, EmptyState } from '@/components/shared/States';
import { StatusDonut } from '@/components/charts/StatusDonut';
import { RevenueArea } from '@/components/charts/RevenueArea';
import { STATUS_COLORS } from '@/components/charts/chartTheme';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchSummary } from './summarySlice';
import { formatCurrency, formatNumber } from '@/lib/format';

export default function SummaryPage() {
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector((s) => s.summary);
  const isLoading = status === 'loading' && !data;
  const isError = status === 'failed';

  useEffect(() => {
    dispatch(fetchSummary());
  }, [dispatch]);

  const maxTop = Math.max(1, ...(data?.topCustomers.map((c) => c.totalValue) ?? [1]));

  if (isError) {
    return (
      <Card>
        <ErrorState message={error ?? undefined} onRetry={() => dispatch(fetchSummary())} />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Summary</h1>
        <p className="text-sm text-muted-foreground">A high-level view of billing across all customers.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total billed" value={data?.totalBilled ?? 0} format={formatCurrency} icon={IndianRupee} accent="violet" loading={isLoading} />
        <StatCard index={1} label="Total tax" value={data?.totalTax ?? 0} format={formatCurrency} icon={TrendingUp} accent="emerald" loading={isLoading} />
        <StatCard index={2} label="Invoices" value={data?.invoiceCount ?? 0} format={formatNumber} icon={Receipt} accent="sky" loading={isLoading} />
        <StatCard index={3} label="Customers" value={data?.customerCount ?? 0} format={formatNumber} icon={Users} accent="amber" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue over time</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : data ? <RevenueArea data={data.monthlyRevenue} /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="mx-auto h-56 w-56 rounded-full" />
            ) : data ? (
              <>
                <StatusDonut data={data.statusBreakdown} total={data.invoiceCount} />
                <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {data.statusBreakdown
                    .slice()
                    .sort((a, b) => b.count - a.count)
                    .map((s) => (
                      <li key={s.status} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[s.status] }} />
                        <span className="text-muted-foreground">{s.status}</span>
                        <span className="ml-auto font-medium tabular-nums">{formatNumber(s.count)}</span>
                      </li>
                    ))}
                </ul>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top customers by value</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data && data.topCustomers.length > 0 ? (
            <ol className="space-y-2">
              {data.topCustomers.map((c, index) => (
                <motion.li
                  key={c.customerId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/customers/${c.customerId}`}
                    className="group flex items-center gap-4 rounded-xl border border-border/60 p-3 transition-colors hover:border-primary/30 hover:bg-accent/50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-sm font-bold text-white shadow-md shadow-primary/20">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{c.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{c.company}</p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(c.totalValue / maxTop) * 100}%` }}
                          transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">{formatCurrency(c.totalValue)}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(c.invoiceCount)} invoices</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </motion.li>
              ))}
            </ol>
          ) : (
            <EmptyState title="No data yet" description="Seed the database to see analytics." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

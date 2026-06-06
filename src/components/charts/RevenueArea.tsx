import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PRIMARY, useChartColors } from './chartTheme';
import { formatCurrency } from '@/lib/format';
import type { MonthlyRevenueEntry } from '@/types/invoice';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const labelFor = (m: string) => {
  const [y, mm] = m.split('-');
  return `${MONTHS[Number(mm) - 1] ?? mm} ${y.slice(2)}`;
};
const compact = (v: number) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(v);

export function RevenueArea({ data }: { data: MonthlyRevenueEntry[] }) {
  const colors = useChartColors();
  const chartData = data.map((d) => ({ ...d, label: labelFor(d.month) }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.35} />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: colors.axis, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={{ fill: colors.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={48} tickFormatter={compact} />
          <Tooltip
            cursor={{ stroke: PRIMARY, strokeOpacity: 0.3 }}
            contentStyle={{
              background: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: 10,
              color: colors.tooltipText,
              fontSize: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }}
            formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
          />
          <Area type="monotone" dataKey="total" stroke={PRIMARY} strokeWidth={2.5} fill="url(#revenueFill)" activeDot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { STATUS_COLORS, useChartColors } from './chartTheme';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { InvoiceStatus } from '@/types/invoice';

export interface StatusDatum {
  status: InvoiceStatus;
  count: number;
  value?: number;
}

export function StatusDonut({ data, total }: { data: StatusDatum[]; total: number }) {
  const colors = useChartColors();
  const chartData = useMemo(() => data.filter((d) => d.count > 0), [data]);

  return (
    <div className="relative h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="status"
            innerRadius={62}
            outerRadius={88}
            paddingAngle={2}
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((d) => (
              <Cell key={d.status} fill={STATUS_COLORS[d.status]} />
            ))}
          </Pie>
          <Tooltip
            cursor={false}
            contentStyle={{
              background: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: 10,
              color: colors.tooltipText,
              fontSize: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }}
            formatter={(value, _n, item) => {
              const datum = item?.payload as StatusDatum | undefined;
              return [`${formatNumber(Number(value))} · ${formatCurrency(datum?.value ?? 0)}`, datum?.status];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums">{formatNumber(total)}</span>
        <span className="text-xs text-muted-foreground">invoices</span>
      </div>
    </div>
  );
}

import { useTheme } from '@/components/theme/ThemeProvider';
import type { InvoiceStatus } from '@/types/invoice';

export const STATUS_COLORS: Record<InvoiceStatus, string> = {
  Paid: '#10b981',
  Sent: '#3b82f6',
  Unpaid: '#f59e0b',
  Overdue: '#ef4444',
  Draft: '#94a3b8',
  Void: '#6b7280',
};

export const PRIMARY = '#6366f1';
export const PRIMARY_LIGHT = '#a78bfa';

export function useChartColors() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  return {
    dark,
    grid: dark ? 'rgba(148,163,184,0.14)' : 'rgba(100,116,139,0.14)',
    axis: dark ? '#94a3b8' : '#64748b',
    tooltipBg: dark ? '#11151f' : '#ffffff',
    tooltipBorder: dark ? 'rgba(148,163,184,0.2)' : 'rgba(100,116,139,0.18)',
    tooltipText: dark ? '#e2e8f0' : '#0f172a',
  };
}

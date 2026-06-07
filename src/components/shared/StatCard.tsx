import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

type Accent = 'violet' | 'emerald' | 'amber' | 'sky' | 'rose';

const ACCENTS: Record<Accent, { icon: string; glow: string }> = {
  violet: { icon: 'from-violet-500 to-indigo-500', glow: 'bg-violet-500/10' },
  emerald: { icon: 'from-emerald-500 to-teal-500', glow: 'bg-emerald-500/10' },
  amber: { icon: 'from-amber-500 to-orange-500', glow: 'bg-amber-500/10' },
  sky: { icon: 'from-sky-500 to-blue-500', glow: 'bg-sky-500/10' },
  rose: { icon: 'from-rose-500 to-pink-500', glow: 'bg-rose-500/10' },
};

interface StatCardProps {
  label: string;
    value: number;
    format?: (value: number) => string;
  icon?: LucideIcon;
  accent?: Accent;
  hint?: string;
  loading?: boolean;
    index?: number;
}

export function StatCard({
  label,
  value,
  format = (v) => Math.round(v).toLocaleString(),
  icon: Icon,
  accent = 'violet',
  hint,
  loading,
  index = 0,
}: StatCardProps) {
  const animated = useCountUp(loading ? 0 : value);
  const colors = ACCENTS[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
    >
      <Card className="card-hover relative overflow-hidden p-5">
        <div className={cn('pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl', colors.glow)} />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="truncate text-2xl font-bold tracking-tight tabular-nums">{format(animated)}</p>
            )}
            {hint && !loading && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          {Icon && (
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg', colors.icon)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

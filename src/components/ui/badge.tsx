import * as React from 'react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  outline: 'text-foreground',
  success: 'border-transparent bg-emerald-100 text-emerald-700',
  warning: 'border-transparent bg-amber-100 text-amber-700',
  danger: 'border-transparent bg-red-100 text-red-700',
  muted: 'border-transparent bg-muted text-muted-foreground',
  info: 'border-transparent bg-blue-100 text-blue-700',
} as const;

const BASE =
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none';

export type BadgeVariant = keyof typeof VARIANTS;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return <div className={cn(BASE, VARIANTS[variant], className)} {...props} />;
}

export { Badge };

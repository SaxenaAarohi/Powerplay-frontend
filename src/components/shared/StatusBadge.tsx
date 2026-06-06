import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';
import type { InvoiceStatus } from '@/types/invoice';

const STATUS_VARIANT: Record<InvoiceStatus, NonNullable<BadgeProps['variant']>> = {
  Paid: 'success',
  Sent: 'info',
  Unpaid: 'warning',
  Overdue: 'danger',
  Draft: 'muted',
  Void: 'secondary',
};

export const StatusBadge = memo(function StatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
});

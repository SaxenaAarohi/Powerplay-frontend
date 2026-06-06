import { useCallback, useMemo, useState } from 'react';
import type { InvoiceStatus } from '@/types/invoice';

export interface InvoiceFilterState {
  search: string;
  status: InvoiceStatus | '';
  taxRate: string;
  customerId: string;
  issueDateFrom: string;
  issueDateTo: string;
  dueDateFrom: string;
  dueDateTo: string;
}

const EMPTY: InvoiceFilterState = {
  search: '',
  status: '',
  taxRate: '',
  customerId: '',
  issueDateFrom: '',
  issueDateTo: '',
  dueDateFrom: '',
  dueDateTo: '',
};

export function useInvoiceFilters(onChange?: () => void) {
  const [filters, setFilters] = useState<InvoiceFilterState>(EMPTY);

  const setFilter = useCallback(
    (patch: Partial<InvoiceFilterState>) => {
      setFilters((prev) => ({ ...prev, ...patch }));
      onChange?.();
    },
    [onChange],
  );

  const reset = useCallback(() => {
    setFilters(EMPTY);
    onChange?.();
  }, [onChange]);

  const activeCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters],
  );

  return { filters, setFilter, reset, activeCount };
}

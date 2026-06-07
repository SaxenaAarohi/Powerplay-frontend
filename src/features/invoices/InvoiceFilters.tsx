import { CalendarDays, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCustomers } from '@/features/customers/useCustomers';
import { INVOICE_STATUSES, TAX_RATES } from '@/types/invoice';
import type { InvoiceFilterState } from './useInvoiceFilters';

const ALL = '__all__';

interface InvoiceFiltersProps {
  filters: InvoiceFilterState;
  onChange: (patch: Partial<InvoiceFilterState>) => void;
  onReset: () => void;
  activeCount: number;
}

export function InvoiceFilters({ filters, onChange, onReset, activeCount }: InvoiceFiltersProps) {
  const { customers } = useCustomers();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search invoice or customer…"
          className="pl-9"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          aria-label="Search invoices"
        />
      </div>

      <div className="flex items-center gap-2 sm:contents">
        <Select
          value={filters.status || ALL}
          onValueChange={(v) => onChange({ status: v === ALL ? '' : (v as InvoiceFilterState['status']) })}
        >
          <SelectTrigger className="min-w-0 flex-1 sm:w-[150px] sm:flex-none">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {INVOICE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.taxRate || ALL} onValueChange={(v) => onChange({ taxRate: v === ALL ? '' : v })}>
          <SelectTrigger className="min-w-0 flex-1 sm:w-[130px] sm:flex-none">
            <SelectValue placeholder="Tax rate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All tax rates</SelectItem>
            {TAX_RATES.map((r) => (
              <SelectItem key={r} value={String(r)}>
                {r}% tax
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.customerId || ALL} onValueChange={(v) => onChange({ customerId: v === ALL ? '' : v })}>
          <SelectTrigger className="min-w-0 flex-1 sm:w-[190px] sm:flex-none">
            <SelectValue placeholder="Customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All customers</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangePopover filters={filters} onChange={onChange} />

        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} className="shrink-0 text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Clear ({activeCount})</span>
          </Button>
        )}
      </div>
    </div>
  );
}

function DateRangePopover({
  filters,
  onChange,
}: {
  filters: InvoiceFilterState;
  onChange: (patch: Partial<InvoiceFilterState>) => void;
}) {
  const hasDates = filters.issueDateFrom || filters.issueDateTo || filters.dueDateFrom || filters.dueDateTo;
  return (
    <Popover>
      <PopoverTrigger className="inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-none sm:justify-start sm:px-4">
        <CalendarDays className="h-4 w-4" />
        Dates
        {hasDates && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary" />}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[calc(100vw-2rem)] max-w-sm space-y-4 sm:w-80">
        <DateRow
          label="Issue date"
          from={filters.issueDateFrom}
          to={filters.issueDateTo}
          onFrom={(v) => onChange({ issueDateFrom: v })}
          onTo={(v) => onChange({ issueDateTo: v })}
        />
        <DateRow
          label="Due date"
          from={filters.dueDateFrom}
          to={filters.dueDateTo}
          onFrom={(v) => onChange({ dueDateFrom: v })}
          onTo={(v) => onChange({ dueDateTo: v })}
        />
      </PopoverContent>
    </Popover>
  );
}

function DateRow({
  label,
  from,
  to,
  onFrom,
  onTo,
}: {
  label: string;
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Input type="date" value={from} onChange={(e) => onFrom(e.target.value)} aria-label={`${label} from`} />
        <Input type="date" value={to} onChange={(e) => onTo(e.target.value)} aria-label={`${label} to`} />
      </div>
    </div>
  );
}

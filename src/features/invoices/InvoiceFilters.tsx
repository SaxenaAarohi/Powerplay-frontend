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
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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

      <Select
        value={filters.status || ALL}
        onValueChange={(v) => onChange({ status: v === ALL ? '' : (v as InvoiceFilterState['status']) })}
      >
        <SelectTrigger className="w-full sm:w-[150px]">
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
        <SelectTrigger className="w-full sm:w-[130px]">
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
        <SelectTrigger className="w-full sm:w-[190px]">
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
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
          <X className="h-4 w-4" /> Clear ({activeCount})
        </Button>
      )}
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
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start sm:w-auto">
          <CalendarDays className="h-4 w-4" />
          Dates
          {hasDates && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-4">
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

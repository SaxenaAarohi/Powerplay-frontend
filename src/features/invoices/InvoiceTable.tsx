import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ChevronsUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Invoice } from '@/types/invoice';

export type SortField = 'amount' | 'total' | 'dueDate' | 'issueDate';

interface InvoiceTableProps {
  invoices: Invoice[];
  sort: SortField;
  order: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}

export const InvoiceTable = memo(function InvoiceTable({
  invoices,
  sort,
  order,
  onSort,
  onEdit,
  onDelete,
}: InvoiceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <SortableHead field="amount" label="Amount" sort={sort} order={order} onSort={onSort} align="right" />
          <TableHead className="text-right">Tax %</TableHead>
          <SortableHead field="total" label="Total" sort={sort} order={order} onSort={onSort} align="right" />
          <TableHead>Status</TableHead>
          <SortableHead field="dueDate" label="Due" sort={sort} order={order} onSort={onSort} />
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice._id} className="anim-row">
            <TableCell className="font-mono text-[13px] font-medium">{invoice.invoiceId}</TableCell>
            <TableCell>
              <Link to={`/customers/${invoice.customerId}`} className="text-primary hover:underline">
                {invoice.customerName}
              </Link>
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatCurrency(invoice.amount)}</TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">{invoice.taxRate}%</TableCell>
            <TableCell className="text-right font-medium tabular-nums">{formatCurrency(invoice.total)}</TableCell>
            <TableCell>
              <StatusBadge status={invoice.status} />
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(invoice.dueDate)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(invoice)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(invoice)} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});

function SortableHead({
  field,
  label,
  sort,
  order,
  onSort,
  align = 'left',
}: {
  field: SortField;
  label: string;
  sort: SortField;
  order: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  align?: 'left' | 'right';
}) {
  const active = sort === field;
  const Icon = !active ? ChevronsUpDown : order === 'asc' ? ArrowUp : ArrowDown;
  return (
    <TableHead className={cn(align === 'right' && 'text-right')}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          'inline-flex items-center gap-1 transition-colors hover:text-foreground',
          align === 'right' && 'flex-row-reverse',
          active && 'text-foreground',
        )}
      >
        {label}
        <Icon className="h-3.5 w-3.5" />
      </button>
    </TableHead>
  );
}

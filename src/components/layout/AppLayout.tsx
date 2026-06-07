import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, FileText, Receipt, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Invoices', icon: FileText, end: true },
  { to: '/summary', label: 'Summary', icon: BarChart3, end: false },
];

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="app-surface flex min-h-screen w-full">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-card/40 backdrop-blur-xl lg:flex">
        <Brand />
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} active={isActive(item, pathname)} />
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-border/60 p-4">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">Invoicer</p>
            <p className="truncate text-[11px] text-muted-foreground">v1.0 · Dashboard</p>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Brand compact />
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.to} {...item} active={isActive(item, pathname)} compact />
            ))}
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function isActive(item: (typeof NAV_ITEMS)[number], pathname: string) {
  return item.end ? pathname === item.to : pathname.startsWith(item.to);
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5 px-4', compact ? 'py-0' : 'h-16 border-b border-border/60')}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-primary-foreground shadow-lg shadow-primary/30">
        <Receipt className="h-5 w-5" />
        <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-amber-300" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <span className="block font-bold tracking-tight">Invoicer</span>
          <span className="block text-[11px] text-muted-foreground">Management suite</span>
        </div>
      )}
    </div>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  active,
  compact,
}: (typeof NAV_ITEMS)[number] & { active: boolean; compact?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
        compact && 'px-2.5',
      )}
    >
      {active && (
        <motion.span
          layoutId={compact ? 'nav-pill-mobile' : 'nav-pill'}
          className="absolute inset-0 rounded-lg bg-primary/10 ring-1 ring-primary/15"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      <Icon className="relative z-10 h-4 w-4" />
      {!compact && <span className="relative z-10">{label}</span>}
      {compact && <span className="sr-only">{label}</span>}
    </NavLink>
  );
}

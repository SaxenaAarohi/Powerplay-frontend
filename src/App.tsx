import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';

const InvoicesPage = lazy(() => import('@/features/invoices/InvoicesPage'));
const CustomerProfilePage = lazy(() => import('@/features/customers/CustomerProfilePage'));
const SummaryPage = lazy(() => import('@/features/summary/SummaryPage'));

function PageFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<PageFallback />}>
              <InvoicesPage />
            </Suspense>
          }
        />
        <Route
          path="summary"
          element={
            <Suspense fallback={<PageFallback />}>
              <SummaryPage />
            </Suspense>
          }
        />
        <Route
          path="customers/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <CustomerProfilePage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

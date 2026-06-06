import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchCustomers } from './customersSlice';

export function useCustomers() {
  const dispatch = useAppDispatch();
  const customers = useAppSelector((s) => s.customers.items);
  const loading = useAppSelector((s) => s.customers.status === 'loading');

  useEffect(() => {
    dispatch(fetchCustomers(undefined));
  }, [dispatch]);

  return { customers, loading };
}

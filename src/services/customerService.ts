import { http } from '@/lib/http';
import type { Customer, CustomerProfile } from '@/types/invoice';

export const customerService = {
  list: (search?: string) => http.get<{ data: Customer[] }>('/customers', search ? { search } : undefined),
  profile: (id: string) => http.get<CustomerProfile>(`/customers/${id}`),
};

import { http } from '@/lib/http';
import type { Summary } from '@/types/invoice';

export const summaryService = {
  get: () => http.get<Summary>('/summary'),
};

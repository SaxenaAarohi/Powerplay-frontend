const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return '';
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') usp.append(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, unknown> } = {},
): Promise<T> {
  const { params, ...init } = options;
  const res = await fetch(`${BASE_URL}${path}${buildQuery(params)}`, {
    headers: { 'Content-Type': 'application/json', ...init.headers },
    ...init,
  });

  if (!res.ok) {

    let message = `Request failed with status ${res.status}`;
    let details: unknown;
    try {
      const body = await res.json();
      message = body?.error?.message ?? message;
      details = body?.error?.details;
    } catch {
          }
    throw new ApiError(res.status, message, details);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const http = {
  get: <T>(path: string, params?: Record<string, unknown>) => request<T>(path, { method: 'GET', params }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

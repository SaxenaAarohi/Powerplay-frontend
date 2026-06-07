# Invoice Management Dashboard — Frontend

The dashboard UI for the Invoice Management app. Built with React, TypeScript, and Vite. It talks
to the backend API to show invoices, customer profiles, and summary analytics.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS with shadcn-style components
- Redux Toolkit for state management and API calls
- Zod for validation
- Recharts (charts), Framer Motion (animations), Lucide (icons), React Toastify (toasts)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
   The app runs at **http://localhost:5173**.

In development, requests to `/api` are proxied to the backend at `http://localhost:4000`, so make
sure the backend is running too.

### Connecting to a deployed backend

For production (e.g. Vercel), set one environment variable:

```
VITE_API_URL = https://your-backend-url/api
```

If it isn't set, the app defaults to `/api` and uses the dev proxy.

## Build

```bash
npm run build     # production build into dist/
npm run preview   # preview the production build locally
```

## Features

- **Invoice list** — paginated, sortable (amount, total, due date), filterable (status, customer,
  tax rate, date ranges), with debounced search.
- **Summary** — total billed/tax, invoice and customer counts, top 5 customers, a status donut, and
  a revenue-over-time chart.
- **Customer profile** — company, key metrics, status mix, and full invoice history.
- **Create / edit invoice** — a modal form with a live tax/total preview.
- Dark mode, loading skeletons, empty/error states, and toast notifications.

## State management

- **Shared server data** (invoices, customers, summary) lives in **Redux Toolkit** slices and is
  fetched through a small service layer — so API calls aren't scattered across components.
- **Local UI state** (filters, sorting, open dialogs) stays in component `useState`.

## Folder structure

```
src/
  app/         Redux store + typed hooks
  services/    API calls (fetch)
  features/    invoices, customers, summary (each: slice + screens)
  components/  ui (button, dialog, table…), shared, charts, layout, theme
  hooks/       small reusable hooks (debounce, count-up)
  lib/         fetch client + formatting helpers
  types/       shared TypeScript types
```

## Assumptions

- Amounts are displayed in **INR**.
- The backend is expected at `/api` (dev proxy) or at `VITE_API_URL` (production).

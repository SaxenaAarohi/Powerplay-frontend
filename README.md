# Invoice Management Dashboard

A full-stack invoice management application. It ingests a seed dataset of ~2,000 invoices
(61 customers, one company per customer) and exposes it through a performant REST API and a
modern, responsive dashboard.

**Stack:** React + TypeScript + Vite + Tailwind + shadcn/ui + Redux Toolkit + plain `fetch` ·
Node.js + Express + TypeScript + MongoDB (Mongoose).

---

## Table of contents

1. [Quick start](#quick-start)
2. [Requirement analysis](#requirement-analysis)
3. [Assumptions](#assumptions)
4. [System architecture](#system-architecture)
5. [Data modeling rationale](#data-modeling-rationale)
6. [API design](#api-design)
7. [Frontend architecture](#frontend-architecture)
8. [State management strategy](#state-management-strategy)
9. [Validation strategy](#validation-strategy)
10. [Security strategy](#security-strategy)
11. [Performance strategy](#performance-strategy)
12. [Folder structure](#folder-structure)
13. [Implementation notes & trade-offs](#implementation-notes--trade-offs)

---

## Quick start

### Prerequisites
- Node.js ≥ 18
- A MongoDB instance (local `mongod` or MongoDB Atlas)

### 1. Backend

```bash
cd backend
cp .env.example .env            # adjust MONGODB_URI if needed
npm install

# Place the provided dataset at backend/seed-data.json
# (or set SEED_FILE to its path in .env)
npm run seed                    # ingest the data

npm run dev                     # API on http://localhost:4000/api
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                     # App on http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:4000`, so no frontend env config is needed.

> No local MongoDB? You can spin up a throwaway, in-memory instance on port 27017 with
> `cd backend && npm run db:local` (leave it running), then seed and start the app as above.

---

## Requirement analysis

From the problem statement and wireframes, the app must provide:

| # | Requirement | Where it lives |
|---|-------------|----------------|
| 1 | Sensible data **models/schema** | `backend/src/models` |
| 2 | **Seed script** that ingests `seed-data.json` | `backend/src/seed.ts` (`npm run seed`) |
| 3 | Paginated, **sortable** (amount, due date), **filterable** (status, customer, issue/due date ranges) invoice table | Invoices screen + `GET /api/invoices` |
| 4 | **Top 5 customers** summary | Summary screen + `GET /api/summary` |
| 5 | **Customer profile**: company, full invoice history, summary metrics | Customer screen + `GET /api/customers/:id` |
| 6 | **Create / edit** invoice form | Invoice modal (`InvoiceFormDialog`) |

The four wireframe screens map to: Invoice list (`/`), Customer profile (`/customers/:id`),
Create/Edit modal (opened from the list), and Summary/analytics (`/summary`).

## Assumptions

- **Currency:** the dataset uses GST-style tax rates (0/3/5/18/28), so amounts are rendered as
  **INR**. This is presentation-only and easy to change in `frontend/src/lib/format.ts`.
- **`tax` and `total` are derived**, not authoritative. The API and seed script always recompute
  them from `amount` + `taxRate`; client-supplied values are ignored. This guarantees consistency.
- **"Outstanding"** (customer profile) = sum of invoice totals with status `Sent`, `Unpaid`, or
  `Overdue` (money still owed). Documented in `customer.service.ts`.
- **Authentication is intentionally omitted** — the assignment doesn't require it, and adding JWT/login
  for a single-tenant dashboard would be overengineering. The API layer is structured so auth
  middleware could be dropped in later without touching feature code.
- **No `invoiceId` from the client is required** on create — the server generates one if omitted
  (matching the `INV-#######` seed format).
- The 1:1 customer→company relationship is treated as an invariant; the seed script warns if the
  dataset ever violates it.

## System architecture

```
┌────────────────────┐      /api (fetch, proxied)      ┌─────────────────────┐
│  React SPA (Vite)  │  ───────────────────────────▶   │  Express REST API    │
│  Redux slices +    │  ◀───────────────────────────   │  (controllers →      │
│  fetch services    │        JSON responses           │   services → models) │
└────────────────────┘                                 └──────────┬──────────┘
                                                                   │ Mongoose
                                                          ┌────────▼────────┐
                                                          │     MongoDB     │
                                                          │ customers,      │
                                                          │ invoices        │
                                                          └─────────────────┘
```

The backend follows a **layered, feature-module** structure:
`routes → validate (Zod) → controller (HTTP only) → service (business logic + data access) → model`.
Controllers never contain business logic; services never touch `req`/`res`. This keeps each layer
independently testable and the responsibilities obvious.

## Data modeling rationale

Two collections instead of one flat invoice collection:

**`Customer`** — `{ name (unique), company }`
Because customer→company is strictly 1:1, promoting the customer to its own collection:
- encodes the invariant in one place (a unique `name`),
- avoids repeating the company string on ~2,000 invoices,
- makes the *customer profile* and *top customers* features first-class.

**`Invoice`** — references `customerId`, **denormalises** `customerName`, stores derived `tax`/`total`.
- `customerId` (indexed `ObjectId`) preserves referential integrity and powers the profile join.
- `customerName` is denormalised so the dashboard's search/display works on a **single collection
  with one index** — no per-row `$lookup` on every page load. Safe here because customers are never
  renamed in this app (the name is set once from the `Customer` record on seed/create).
- `tax`/`total` are **stored but always recomputed** on write (a `pre('validate')` hook). Storing
  them lets MongoDB sort and `$sum` on indexed numeric fields; recomputing them guarantees they can
  never drift from `amount`/`taxRate` or be tampered with via the API.
- Dates are stored as native `Date` (not ISO strings) so range filters and sorts use indexes.

**Indexes** are tuned to the dashboard's access patterns: `invoiceId` (unique), `customerId`,
`status`, `issueDate`, `dueDate`, `amount`, `total`, `customerName`, and a compound
`{ status, dueDate }` for the common "filter by status, sort by due date" combination.

## API design

Base URL: `/api`. Consistent envelopes: lists return `{ data, pagination }`; errors return
`{ error: { message, details? } }`.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET`  | `/invoices` | Paginated/sortable/filterable list |
| `POST` | `/invoices` | Create invoice (tax/total derived server-side) |
| `GET`  | `/invoices/:id` | Single invoice |
| `PATCH`| `/invoices/:id` | Edit invoice |
| `DELETE`| `/invoices/:id` | Delete invoice |
| `GET`  | `/customers` | Customer list (dropdown/filter, supports `?search=`) |
| `GET`  | `/customers/:id` | Customer profile + metrics + invoice history |
| `GET`  | `/summary` | Totals + top 5 customers |
| `GET`  | `/health` | Liveness check |

**`GET /invoices` query params:** `page`, `limit`, `sort` (`amount\|total\|dueDate\|issueDate\|createdAt`),
`order` (`asc\|desc`), `search`, `status`, `customerId`, `taxRate`, `issueDateFrom/To`, `dueDateFrom/To`.
All are validated and coerced by Zod before reaching the service.

## Frontend architecture

- **Feature-based**: each screen is a self-contained folder under `src/features/*`
  (`invoices`, `customers`, `summary`). Cross-cutting UI lives in `src/components/ui` (shadcn
  primitives) and `src/components/shared` (reusable composites like `StatCard`, `Pagination`,
  `ConfirmDialog`, `StatusBadge`, empty/error states).
- **Routing**: React Router with **lazy-loaded routes** — each screen is its own chunk
  (verified in the build output), so the initial load only ships the shell + the landing dashboard.
- **Forms**: React Hook Form + Zod via `zodResolver`. The form schema mirrors the backend so users
  get instant, friendly validation; the server re-validates as the source of truth.

## State management strategy

A clear three-way split — each kind of state lives where it belongs:

- **Shared server state → Redux Toolkit slices + `createAsyncThunk`.** The store holds the data
  multiple screens read: the invoice table (`invoicesSlice`), the customers list shared by the
  filter *and* the form (`customersSlice`), the active customer profile (`customerProfileSlice`),
  and the dashboard summary (`summarySlice`). Thunks fetch with plain `fetch` (see below); each slice
  tracks `status`/`error` so components get loading/error states without ad-hoc flags.
- **Network → plain `fetch`** via a centralised client (`src/lib/http.ts`) and a typed service layer
  (`src/services/*`). Thunks call services; components never call `fetch` directly.
- **Local UI state → `useState`** (filters, sort, pagination, dialog open/close). It's scoped to one
  screen, so putting it in Redux would be needless global state. `useInvoiceFilters` encapsulates
  the dashboard's filter logic.
- **Form state → React Hook Form.** No global store involved.
- **`useEffect`** is used only for its legitimate purpose — kicking off a fetch on mount / when query
  params change (`dispatch(fetchInvoices(params))`), not for deriving state.

Notes that show intent:
- `fetchCustomers` uses a thunk **`condition` guard** so repeated dispatches (filter + form both need
  the list) collapse into a single request — no duplicate fetches.
- After a create/edit/delete, the component `unwrap()`s the thunk and re-fetches the current page +
  summary, so the table and KPI cards stay consistent.

*(An earlier version used RTK Query; this was deliberately rewritten to plain `fetch` + hand-written
slices to demonstrate the underlying Redux async data flow explicitly.)*

## Validation strategy

- **Frontend:** Zod schema + React Hook Form. Inline, user-friendly messages; submit is blocked
  until valid.
- **Backend:** a generic `validate({ body, query, params })` middleware parses every request with
  Zod and replaces the raw input with typed, coerced data. Mongoose schema constraints (enums,
  `min`, `required`) are a second line of defense. Every validation failure returns a consistent
  `400 { error: { message, details: [{ field, message }] } }`.

## Security strategy

- **Helmet** for secure HTTP headers; **CORS** restricted to configured origins.
- **Rate limiting** (`express-rate-limit`) on the `/api` surface.
- **Input validation** on every endpoint (Zod) + Mongoose casting — queries are built from
  explicit, typed fields only, so there's **no operator/`$`-injection surface**.
- User-supplied search strings are **regex-escaped** before use (prevents ReDoS / injection).
- Secrets/config come from **environment variables**, validated at startup (`config/env.ts`);
  nothing sensitive is committed (`.env` is gitignored, `.env.example` documents the shape).
- The central **error handler** never leaks stack traces or driver internals in production.

## Performance strategy

**Backend**
- Aggregations (`$group`, `$lookup`) compute summary/profile metrics **in the database** — we never
  load 2,000 docs into Node to reduce them.
- List endpoint runs the page query and `countDocuments` **in parallel** (`Promise.all`) and uses
  `.lean()` for plain-object reads.
- Indexes back every filter/sort path; `insertMany` is used for bulk seeding.

**Frontend**
- **Lazy routes + code splitting** (separate chunks per screen).
- **Debounced search** (350 ms) so typing doesn't fire a request per keystroke.
- **De-duplicated fetches** — the shared customers list is fetched once via a thunk `condition`
  guard; the dashboard reads summary from the same slice the Summary screen populates. A non-blocking
  "fetching" hint avoids unmounting the table on refetch.
- `React.memo` on the hot, frequently-re-rendered components (`InvoiceTable`, `StatusBadge`) and
  memoised query params so thunk dispatches stay stable.
- Server-side **pagination** keeps the DOM small regardless of dataset size.

## Folder structure

```
.
├── backend/
│   └── src/
│       ├── config/        env (Zod-validated) + db connection
│       ├── models/        Customer, Invoice (Mongoose schemas + indexes)
│       ├── modules/       feature modules: invoices · customers · summary
│       │   └── <feature>/ routes · controller · service · validation
│       ├── middleware/    validate · errorHandler · notFound
│       ├── utils/         AppError · asyncHandler · money (tax/total)
│       ├── app.ts         Express app assembly (testable, no port)
│       ├── server.ts      bootstrap + graceful shutdown
│       └── seed.ts        dataset ingestion script
└── frontend/
    └── src/
        ├── app/           Redux store + typed hooks
        ├── services/      typed fetch services (invoice/customer/summary)
        ├── components/
        │   ├── ui/        shadcn/ui primitives
        │   ├── shared/    reusable composites (StatCard, Pagination, …)
        │   ├── charts/    recharts wrappers (donut, area)
        │   ├── theme/     dark-mode provider + toggle
        │   └── layout/    AppLayout (sidebar/topbar shell)
        ├── features/      invoices · customers · summary (each: slice + screens)
        ├── hooks/         useDebouncedValue, useCountUp
        ├── lib/           http (fetch client), utils (cn), format, money
        └── types/         shared domain types
```

## Implementation notes & trade-offs

- **Mongoose over Prisma:** the assignment mandates Mongoose, and it's the better fit for MongoDB's
  document/aggregation model and 1:1 modeling here.
- **Denormalising `customerName`** trades a tiny write-time cost for a large read-time win on the
  hottest query (the table). It's safe because there's no rename feature; if one were added, a single
  service method would update the affected invoices.
- **No auth, no Multer:** neither is required by the spec; adding them would be overengineering. The
  layering makes them easy to add later.
- **API was validated end-to-end** against an in-memory MongoDB (derived totals, pagination, sorting,
  filtering, search, summary/profile aggregations, create/update derivation, and validation
  rejection all verified) before shipping.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Build & production
npm run build
npm start

# Database
npx prisma migrate dev --name <migration-name>   # Create and apply a migration
npx prisma db push                               # Push schema without a migration file (prototyping)
npx prisma db seed                               # Run prisma/seed.ts
npx prisma studio                                # Open Prisma Studio GUI
npx prisma generate                              # Regenerate Prisma Client after schema changes
```

TypeScript is checked by Next.js on build. There is no separate lint script configured yet.

---

## Project Overview

Bangladesh government fuel distribution monitoring system. Three user roles — Vehicle Owner, Petrol Pump Operator, Government Admin — each with a separate dashboard. All external data (BRTA vehicle registry, pump registry) is dummy/seeded; no real external APIs.

**V1 scope:** Simple login only (3 pre-seeded accounts). No registration, no push notifications. Owners see fresh data on page load.

---

## Architecture

### Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, no `src/` dir) |
| Database | **SQLite** via Prisma 5 (file: `prisma/dev.db`) — no server needed |
| Auth | NextAuth.js v4 — credentials provider, JWT strategy |
| UI | Tailwind CSS v4 + shadcn/ui (base-ui variant) |
| Charts | Recharts |
| Forms | React Hook Form + Zod v4 |
| Client data | SWR |
| Dates | date-fns |
| Toasts | Sonner (via `components/ui/sonner.tsx`) |

### SQLite + Prisma enums note

SQLite does not support Prisma enums. All `Role`, `VehicleType`, and `TransactionStatus` fields are stored as plain `String` in the DB. The canonical values live in `types/index.ts` as `const` objects and are used for all comparisons and validations.

### Next.js 16 notes

- Route protection file is `proxy.ts` (not `middleware.ts`) — Next.js 16 renamed this convention.
- `params` in dynamic route handlers is a `Promise` and must be awaited: `const { id } = await params`.
- `searchParams` in Server Component page props is also a `Promise` and must be awaited.

### Tailwind CSS v4 note

This project uses **Tailwind v4**, which imports via `@import "tailwindcss"` in `globals.css` — not via `tailwind.config.js`. There is no `tailwind.config.ts`. Custom tokens are defined with `@theme inline { ... }` in CSS. When adding new theme tokens, add them there.

### shadcn/ui note

Components were generated with the `base-ui` variant. They import from `@base-ui/react/*` rather than `@radix-ui/*`. Do not manually edit files in `components/ui/` — regenerate them with `npx shadcn@latest add <component>` if changes are needed. Use `cn()` from `lib/utils.ts` for class merging.

### App Router structure

```
app/
├── layout.tsx                  # Root layout — add <Toaster /> here
├── page.tsx                    # Root: redirect to /login or role dashboard
├── (auth)/login/               # Login page (no sidebar)
├── (dashboard)/                # Shared layout with sidebar + topbar
│   ├── owner/                  # VEHICLE_OWNER pages
│   ├── operator/               # OPERATOR pages
│   └── admin/                  # ADMIN pages
└── api/
    ├── auth/[...nextauth]/     # NextAuth handler
    ├── owner/                  # Owner API routes
    ├── operator/               # Operator API routes
    └── admin/                  # Admin API routes
```

Route protection is handled in `middleware.ts` (to be created) using NextAuth `getToken`.

### Business logic

All non-trivial logic lives in `lib/` — route handlers are thin wrappers:

- `lib/prisma.ts` — Prisma client singleton (never instantiate `PrismaClient` elsewhere)
- `lib/auth.ts` — NextAuth config with role-aware JWT callbacks
- `lib/eligibility.ts` — Core quota check: finds latest approved transaction, compares against `DistributionRule.restrictionDays`
- `lib/scheduler.ts` — Auto-assigns next `FuelSchedule` after a successful dispense
- `lib/validators/` — Zod schemas for API input validation

### Critical flow: fuel dispensing

The operator dispense endpoint (`POST /api/operator/dispense`) must:
1. Re-run eligibility check **inside** a `prisma.$transaction()` to prevent race conditions
2. Insert `FuelTransaction`
3. Call `assignNextSchedule()`
4. Commit

This is the only place a full Prisma transaction is strictly required.

### Database

Key relationships:
- `Vehicle` → `FuelTransaction[]` (history)
- `Vehicle` → `FuelSchedule[]` (upcoming slots)
- `User` (OPERATOR) → `FuelTransaction[]` (who dispensed)
- `DistributionRule` — one row per `VehicleType`, admin-editable at runtime
- `BrtaVehicle` + `PumpRegistry` — read-only reference tables, only queried during registration validation

In V1, `Vehicle` rows are pre-seeded (no user-facing registration). The single owner account can view all seeded vehicles.

---

## Seeded Accounts (V1)

| Role | Email | Password |
|---|---|---|
| Vehicle Owner | owner@fuel.bd | Owner@1234 |
| Pump Operator | operator@fuel.bd | Operator@1234 |
| Government Admin | admin@fuel.bd | Admin@1234 |

---

## Fuel Distribution Rules (seeded defaults)

| Vehicle Type | Max Liters | Restriction Days |
|---|---|---|
| MOTORCYCLE | 4 L | 3 |
| CNG_AUTO_RICKSHAW | 3 L | 2 |
| CAR | 10 L | 3 |
| MICROBUS | 15 L | 3 |
| TRUCK | 20 L | 2 |
| BUS | 30 L | 2 |

---

## Coding Conventions

- Server Components by default; `"use client"` only for forms, hooks, charts
- API routes: validate with Zod → call `lib/` function → return response. No business logic in route files.
- Error shape: `{ error: string }` with appropriate HTTP status
- Date arithmetic: always use `date-fns` (`addDays`, `isBefore`, etc.)
- Toast notifications: `import { toast } from "sonner"` — `toast.success(...)` / `toast.error(...)`
- `@/*` path alias maps to the project root (e.g. `@/lib/prisma`, `@/components/ui/button`)
- Zod v4: use `.issues` not `.errors` on `ZodError`; `invalid_type_error` option removed from `z.number()`

---

## Rules

1. Read this file before making any changes.
2. Do not add features outside V1 scope without explicit user instruction.
3. No registration pages — login only.
4. No push notifications — owners see fresh data on page load via SWR or Server Component re-fetch.
5. Do not install new packages without confirming with the user first.
6. Update this file after every phase that adds new structure or conventions.

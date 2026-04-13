@AGENTS.md

# Fuel Distribution Management System — CLAUDE.md

Always read this file before making any changes to the codebase.

---

## Project Overview

A web-based system for the Bangladesh government to monitor and control fuel distribution during a fuel crisis. Three user roles with separate dashboards. All data is dummy/seeded — no real external APIs.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, no src/ dir) |
| Database | PostgreSQL |
| ORM | Prisma 5 |
| Auth | NextAuth.js v4 (credentials provider, JWT strategy) |
| UI | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Data fetching | SWR (client-side), fetch in Server Components |
| Dates | date-fns |
| Passwords | bcryptjs |

---

## V1 Scope (what is and isn't built)

### Included
- Simple login (email + password) — 3 pre-seeded accounts, one per role
- No user registration — accounts are seeded only
- Vehicle owner sees data updates on page load (no push notifications)
- Three role dashboards: Vehicle Owner, Petrol Pump Operator, Government Admin
- Core fuel eligibility engine with restriction periods
- Auto-scheduling of next refuel slot after dispensing
- Dummy BRTA vehicle table and pump registry table (read-only reference data)

### Excluded from V1
- User registration / sign-up flow
- Push notifications / real-time updates
- Email notifications
- SMS alerts
- Real external APIs (BRTA, pump registry are dummy tables)

---

## User Roles & Credentials (seeded)

| Role | Email | Password |
|---|---|---|
| Vehicle Owner | owner@fuel.bd | Owner@1234 |
| Pump Operator | operator@fuel.bd | Operator@1234 |
| Government Admin | admin@fuel.bd | Admin@1234 |

---

## Fuel Distribution Rules (seeded, admin-editable)

| Vehicle Type | Max Liters/Cycle | Restriction Days |
|---|---|---|
| MOTORCYCLE | 4 L | 3 days |
| CNG_AUTO_RICKSHAW | 3 L | 2 days |
| CAR | 10 L | 3 days |
| MICROBUS | 15 L | 3 days |
| TRUCK | 20 L | 2 days |
| BUS | 30 L | 2 days |

---

## Folder Structure

```
fuel-app/
├── CLAUDE.md                    # This file — read before every action
├── prisma/
│   ├── schema.prisma            # Full data model
│   └── seed.ts                  # Seed script — dummy data
├── app/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Root redirect (→ /login or dashboard)
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Shared sidebar + topbar shell
│   │   ├── owner/
│   │   │   ├── page.tsx         # Overview: eligibility status, recent transactions
│   │   │   ├── history/page.tsx
│   │   │   └── schedule/page.tsx
│   │   ├── operator/
│   │   │   ├── page.tsx         # Dispense fuel main screen
│   │   │   └── history/page.tsx
│   │   └── admin/
│   │       ├── page.tsx         # Stats overview with charts
│   │       ├── transactions/page.tsx
│   │       ├── users/page.tsx
│   │       ├── rules/page.tsx
│   │       └── reports/page.tsx
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/route.ts
│       ├── owner/
│       │   ├── vehicles/route.ts
│       │   ├── vehicles/[vehicleId]/history/route.ts
│       │   ├── vehicles/[vehicleId]/schedule/route.ts
│       │   └── vehicles/[vehicleId]/status/route.ts
│       ├── operator/
│       │   ├── eligibility-check/route.ts
│       │   ├── dispense/route.ts
│       │   └── transactions/route.ts
│       └── admin/
│           ├── stats/overview/route.ts
│           ├── stats/by-vehicle-type/route.ts
│           ├── transactions/route.ts
│           ├── users/route.ts
│           ├── users/[id]/status/route.ts
│           ├── rules/route.ts
│           ├── rules/[vehicleType]/route.ts
│           └── reports/export/route.ts
├── components/
│   ├── ui/                      # shadcn/ui components (do not edit manually)
│   ├── layout/
│   │   ├── Sidebar.tsx          # Role-aware sidebar navigation
│   │   └── Topbar.tsx           # Top bar with user info + logout
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   └── TransactionTable.tsx
│   ├── charts/
│   │   ├── FuelByTypeChart.tsx
│   │   ├── DailyTrendChart.tsx
│   │   └── DistrictPieChart.tsx
│   └── operator/
│       ├── EligibilityChecker.tsx
│       └── EligibilityResult.tsx
├── lib/
│   ├── prisma.ts                # Prisma client singleton
│   ├── auth.ts                  # NextAuth config
│   ├── eligibility.ts           # Core quota check logic
│   ├── scheduler.ts             # Auto-assign next schedule
│   └── validators/
│       ├── dispense.ts          # Zod schema for dispense request
│       └── rules.ts             # Zod schema for rule updates
├── types/
│   └── index.ts                 # Shared TypeScript types
└── middleware.ts                 # Route protection (auth + role guards)
```

---

## Database Schema (tables)

- `brta_vehicles` — dummy BRTA reference (read-only, used in registration validation)
- `pump_registry` — dummy govt pump reference (read-only)
- `users` — all three roles
- `operator_profiles` — operator-specific: trade license, pump name/address
- `vehicles` — registered vehicles linked to owners
- `distribution_rules` — quota rules per vehicle type (admin-editable at runtime)
- `fuel_transactions` — every dispense event (APPROVED / BLOCKED / PARTIAL)
- `fuel_schedules` — auto-assigned next refuel slot per vehicle

---

## Coding Conventions

- Use TypeScript everywhere — no `any` unless absolutely unavoidable
- Server Components by default; add `"use client"` only when needed (forms, hooks, charts)
- API route handlers validate input with Zod before touching the DB
- All DB writes that affect eligibility use `prisma.$transaction()` to prevent race conditions
- Use `lib/prisma.ts` singleton — never instantiate `PrismaClient` directly in route handlers
- Keep business logic in `lib/` — route handlers should be thin (validate → call lib → respond)
- Use `date-fns` for all date arithmetic — no manual ms calculations
- Error responses: `{ error: string }` with appropriate HTTP status codes
- Success responses: return the relevant data object directly (no wrapper)
- shadcn/ui components live in `components/ui/` — do not manually edit them
- Tailwind only — no inline styles, no CSS modules

---

## Rules

1. Always read CLAUDE.md before making any code changes.
2. Do not add features outside V1 scope without explicit user instruction.
3. Do not create registration pages or flows — login only.
4. Do not add push notifications — owners see fresh data on page load.
5. Keep code simple and well-documented — no over-engineering.
6. Do not install new packages without confirming with the user first.
7. After every phase completion, update this file with any new conventions or structural changes.

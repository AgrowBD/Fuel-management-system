# Fuel Distribution Management System

A web-based system for the Bangladesh government to monitor and control fuel distribution during a fuel crisis. Three user roles — Vehicle Owner, Pump Operator, and Government Administrator — each with a dedicated dashboard.

---

## How the system works

During a fuel crisis, vehicles can show up at any pump repeatedly. There is no way to know if a vehicle already received fuel elsewhere. This system solves that by tracking every dispense centrally and enforcing a waiting period before the same vehicle can receive fuel again.

### Core flow

1. A vehicle owner goes to a petrol pump.
2. The pump operator opens the **Operator Dashboard** and enters the vehicle's license plate number.
3. The system checks the central database:
   - If the vehicle received fuel recently and is still within its restriction window → **blocked**, shown in red with the earliest eligible time.
   - If the vehicle is eligible → shown in green with the maximum liters allowed.
4. The operator enters the actual liters dispensed and confirms.
5. The system records the transaction and automatically assigns the vehicle's next scheduled refuel slot.
6. The vehicle owner can log in at any time to see their fuel history, current restriction status, and upcoming schedule.
7. Government admins get a live overview: total liters dispensed, compliance stats, per-vehicle-type breakdowns, and can adjust quota rules at any time without touching the code.

### Default restriction rules (admin can change these live)

| Vehicle Type | Max Liters | Must wait |
|---|---|---|
| Motorcycle | 4 L | 3 days |
| CNG Auto-Rickshaw | 3 L | 2 days |
| Car | 10 L | 3 days |
| Microbus | 15 L | 3 days |
| Truck | 20 L | 2 days |
| Bus | 30 L | 2 days |

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) — frontend + backend in one project |
| Database | SQLite via Prisma 5 — file-based, zero configuration |
| Auth | NextAuth.js v4 — JWT sessions with role embedded in token |
| UI | Tailwind CSS v4 + shadcn/ui |
| Language | TypeScript |

---

## Requirements

- **Node.js v20 or later** — check with `node -v`. Download from [nodejs.org](https://nodejs.org) if needed.
- A terminal (Command Prompt, PowerShell, or Git Bash on Windows)
- Internet connection for the initial setup only

---

## First-time setup

Do this once after cloning the repo. You will not need to repeat these steps.

### 1. Install dependencies

```bash
npm install
```

Downloads all packages (~200 MB). Uses the exact versions from `package-lock.json` — no conflicts.

### 2. Set up environment variables

```bash
# Linux / macOS / Git Bash
cp .env.example .env

# Windows Command Prompt
copy .env.example .env
```

The defaults in `.env.example` work as-is for local development. No edits needed.

### 3. Create the database

```bash
npx prisma migrate dev --name init
```

Creates the SQLite database file (`prisma/dev.db`) and all tables.

### 4. Load demo data

```bash
npx prisma db seed
```

Creates 3 login accounts, 6 vehicles, distribution rules, and 14 historical transactions so the dashboards have something to show.

### 5. Start the app

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Running the app after setup

Once the setup above is done, all you need every time is just go into the project folderand run:

```bash
npm run dev
```

Then open **http://localhost:3000**.

The database and all data persist between runs — nothing resets unless you explicitly wipe it.

---

## Login accounts

| Role | Email | Password |
|---|---|---|
| Vehicle Owner | owner@fuel.bd | Owner@1234 |
| Pump Operator | operator@fuel.bd | Operator@1234 |
| Government Admin | admin@fuel.bd | Admin@1234 |

---

## Resetting the database

To wipe all data and start fresh with clean demo data:

```bash
npx prisma migrate reset
```

This drops all tables, re-creates them, and re-runs the seed automatically. Safe to run as many times as you want.

---

## Customising the demo data

Edit `prisma/seed.ts` before running the seed. Then apply with `npx prisma migrate reset`.

### Add vehicles

Find the `vehicleData` array and add an entry:

```ts
{ licenseNumber: "DHA-GA-11-9999", vehicleType: "CAR", make: "Toyota", model: "Premio", year: 2021, ownerName: "Your Name" }
```

Valid `vehicleType` values: `MOTORCYCLE`, `CNG_AUTO_RICKSHAW`, `CAR`, `MICROBUS`, `TRUCK`, `BUS`

### Change passwords

Find the `Users` section and edit the value inside `bcrypt.hash(...)`:

```ts
passwordHash: await bcrypt.hash("YourNewPassword123", saltRounds),
```

Use something with uppercase, lowercase, and a number.

### Add historical transactions

Find the `transactionSeed` array and add an entry:

```ts
{ vehicle: "DHA-GA-11-4001", litersRequested: 10, litersDispensed: 10, status: "APPROVED", daysAgo: 5 },
```

- `daysAgo: 1` → vehicle is currently restricted
- `daysAgo: 10` → vehicle is eligible now
- `status`: `APPROVED`, `PARTIAL`, or `BLOCKED`

---

## Common commands

```bash
npm run dev                  # Start the development server
npx prisma studio            # Open a visual database browser
npx prisma db seed           # Re-load demo data without wiping migrations
npx prisma migrate reset     # Wipe and rebuild the database from scratch
```

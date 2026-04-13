# Fuel Distribution Management System

A web-based system for the Bangladesh government to monitor and control fuel distribution during a fuel crisis. Three user roles — Vehicle Owner, Pump Operator, and Government Administrator — each with a dedicated dashboard.

---

## How the system works

### The problem it solves
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
7. Government admins get a live overview: total liters dispensed, compliance stats, per-vehicle-type breakdowns, and can adjust the quota rules at any time without touching the code.

### Restriction rules (defaults, admin can change)

| Vehicle Type | Max Liters | Must wait |
|---|---|---|
| Motorcycle | 4 L | 3 days |
| CNG Auto-Rickshaw | 3 L | 2 days |
| Car | 10 L | 3 days |
| Microbus | 15 L | 3 days |
| Truck | 20 L | 2 days |
| Bus | 30 L | 2 days |

### How requests work

**Page loads** — When you navigate to a page (e.g. `/admin/rules`), the server renders the full HTML by reading the database directly. No API call is made. The browser receives a complete page.

**Button clicks** — When you click something interactive (e.g. Check Eligibility, Save Rule), the browser sends an HTTP request to an API route (e.g. `POST /api/operator/eligibility-check`). The server validates the input, queries the database, and returns JSON. React updates the UI with the result.

**Database** — All data lives in a single SQLite file (`prisma/dev.db`) on the server. No separate database server is needed.

---

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Handles both the frontend and backend in one project. Pages can run server-side (faster, no API needed) or client-side. Eliminates the need for a separate Express/Django server. |
| **Database** | SQLite via Prisma | SQLite is a file-based database — zero configuration, no installation, works on any machine. Prisma provides type-safe queries and handles migrations. For production at scale, swap to PostgreSQL by changing one line. |
| **Authentication** | NextAuth.js v4 | Handles login sessions with signed JWT cookies. Role information (owner/operator/admin) is embedded in the token, so every API route can check the role without a database lookup. |
| **UI components** | shadcn/ui + Tailwind CSS v4 | shadcn/ui provides accessible, well-designed components (buttons, cards, tables, dialogs). Tailwind handles all layout and custom styling with utility classes — no separate CSS files needed. |
| **Forms** | React Hook Form + Zod | React Hook Form handles form state and validation without re-rendering the whole page. Zod defines the shape of expected data and validates it both on the client (instant feedback) and on the server (security). |
| **Charts** | Recharts | Lightweight chart library built for React. Used on the admin dashboard for the fuel-by-vehicle-type bar chart. |
| **Dates** | date-fns | Small, tree-shakeable library for date arithmetic. Used for calculating restriction windows (`lastFuelled + restrictionDays > now`). |
| **Language** | TypeScript | Catches type mismatches at compile time. All database models, API responses, and component props are typed — reduces runtime errors significantly. |

---

## Is internet required to run this?

**During setup** — Yes. You need internet once to run `npm install` (downloads all packages) and once to load Google Fonts on the first page render.

**After setup** — No. Once packages are installed and the app has loaded once, everything runs fully offline:
- The database is a local file.
- The server runs on your machine.
- No external API calls are made.

To avoid needing internet even on first render, replace the Google Font imports in `app/layout.tsx` with a system font — but this is optional and only cosmetic.

---

## Will there be dependency conflicts?

**Short answer: No**, as long as you use Node.js v20 or later.

Here is why:

- **`package-lock.json` is included.** When you run `npm install`, npm reads this file and installs the exact same versions of every package that the original developer used. No version guessing, no mismatches.
- **No global tools required.** Everything runs through `npx` (bundled with npm) or local `node_modules`. You do not need to install Prisma, Next.js, or TypeScript globally.
- **The database is local per machine.** Each person who sets up the project gets their own fresh `dev.db` file. There is no shared database to conflict with.
- **Environment variables are local.** The `.env` file is gitignored and never committed. Each person copies `.env.example` to `.env` and fills it in — the example file ships with the repo.

The only hard requirement is **Node.js v20+**. If someone installs on Node 18 or older, some packages may fail. Run `node -v` before starting.

---

## Customising the demo data

The file `prisma/seed.ts` controls all the data that gets loaded when you run `npx prisma db seed`. Every section is clearly labeled and easy to edit before seeding.

### What the seed creates

| Section | What it adds |
|---|---|
| BRTA vehicles | 14 dummy government-registered vehicles (reference table, read-only) |
| Pump registry | 5 dummy registered petrol pumps (reference table, read-only) |
| Distribution rules | 6 quota rules, one per vehicle type |
| Users | 3 accounts (admin, owner, operator) |
| Vehicles | 6 vehicles that show up on the owner dashboard |
| Transactions | 14 historical fuel records, some recent (restricted) and some old (eligible) |
| Schedules | 3 upcoming scheduled refuel slots |

### How to add your own vehicles

Open `prisma/seed.ts` and find the `vehicleData` array (around line 80). Add a new entry:

```ts
{ licenseNumber: "DHA-GA-11-9999", vehicleType: "CAR", make: "Toyota", model: "Premio", year: 2021, ownerName: "Your Name" }
```

Valid values for `vehicleType`: `MOTORCYCLE`, `CNG_AUTO_RICKSHAW`, `CAR`, `MICROBUS`, `TRUCK`, `BUS`

### How to change login passwords

Find the `Users` section in `prisma/seed.ts`. Change the password string inside `bcrypt.hash(...)`:

```ts
passwordHash: await bcrypt.hash("YourNewPassword123", saltRounds),
```

Password rules: use something with uppercase, lowercase, and a number.

### How to add more historical transactions

Find the `transactionSeed` array. Each entry looks like this:

```ts
{ vehicle: "DHA-GA-11-4001", litersRequested: 10, litersDispensed: 10, status: "APPROVED", daysAgo: 5 },
```

- `daysAgo` — how many days ago this transaction happened. Set to `1` to make a vehicle restricted now, `10` to make it eligible.
- `status` — `APPROVED`, `PARTIAL` (requested more than quota), or `BLOCKED`

### After editing the seed file

Re-run the seed:
```bash
npx prisma migrate reset
```

This wipes the database and re-seeds with your updated data. Safe to run as many times as you want.

---

## Local setup (step by step)

### What you need before starting

- **Node.js v20 or later** — download from [nodejs.org](https://nodejs.org). Run `node -v` to check your version.
- **Git** (optional, only if cloning from a repository)
- A terminal (Command Prompt, PowerShell, or Windows Terminal on Windows)

### 1. Get the project files

If you received a zip file, extract it. If cloning:
```bash
git clone <repository-url>
cd fuel-app
```

If you already have the folder, open a terminal and navigate to it:
```bash
cd path\to\fuel-app
```

### 2. Install dependencies

This downloads all required packages (~150 packages, about 200MB):
```bash
npm install
```

> Requires internet. Takes 1–3 minutes depending on connection speed. Uses the exact versions from `package-lock.json` — no conflicts.

### 3. Set up environment variables

Copy the .env.example file to create your local file called `.env`:

```bash
# Linux / macOS / Git Bash on Windows
cp .env.example .env

# Windows Command Prompt
copy .env.example .env
```

The defaults in `.env.example` work as-is for local development — no edits needed.

> **Before deploying to a public server**, replace `NEXTAUTH_SECRET` with a strong random value. You can generate one with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```
> Paste the output as the value. The `.env` file is gitignored and must never be committed.

### 4. Set up the database

This creates the SQLite database file and all the tables:
```bash
npx prisma migrate dev --name init
```

### 5. Fill the database with demo data

This creates the 3 login accounts, 6 vehicles, distribution rules, and 14 historical transactions so the dashboards have something to show:
```bash
npx prisma db seed
```

### 6. Start the app

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

---

## Login accounts (demo)

| Role | Email | Password |
|---|---|---|
| Vehicle Owner | owner@fuel.bd | Owner@1234 |
| Pump Operator | operator@fuel.bd | Operator@1234 |
| Government Admin | admin@fuel.bd | Admin@1234 |

---

## Resetting the database

If you want to start fresh with clean demo data:
```bash
npx prisma migrate reset
```

This drops all tables, re-creates them, and re-runs the seed automatically.

---

## Project structure (quick reference)

```
fuel-app/
├── app/                    # All pages and API routes
│   ├── (auth)/login/       # Login page
│   ├── (dashboard)/        # Owner, Operator, Admin pages
│   └── api/                # API endpoints (JSON responses)
├── components/             # Reusable UI components
├── lib/                    # Business logic (eligibility check, scheduler, auth)
├── prisma/
│   ├── schema.prisma       # Database table definitions
│   ├── seed.ts             # Demo data — edit this to customise
│   └── dev.db              # Created locally after setup — gitignored, never committed
├── types/                  # Shared TypeScript types
├── .env.example            # Template for environment variables — copy to .env
├── DEPLOYMENT.md           # Instructions for hosting on a VPS or shared hosting
└── CLAUDE.md               # Notes for AI assistants working on this codebase
```

---

## Common commands

```bash
npm run dev                # Start development server (http://localhost:3000)
npm run build              # Build for production
npm start                  # Start production server (run build first)

npx prisma studio          # Open visual database browser in your browser
npx prisma db seed         # Re-populate demo data (safe to re-run)
npx prisma migrate reset   # Wipe and rebuild the database from scratch
```

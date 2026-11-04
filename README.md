# Fuel Distribution Management System

The Fuel Distribution Management System is a role-based platform for controlling,
recording, and analysing fuel distribution across registered vehicles and fuel
stations. It provides a shared operational record for vehicle owners, pump
operators, fuel companies, and government administrators.

## Purpose

The system helps authorities distribute limited fuel fairly and transparently.
Every dispense is linked to a vehicle registration, operator, pump, fuel company,
time, quantity, and outcome. Centralised eligibility checks prevent repeated
dispensing across different stations during a restriction period, while quota
rules remain configurable as policy changes.

## User roles

### Vehicle owner

- View all vehicles associated with the owner's account.
- See current eligibility and restriction status.
- Review fuel history, quantities, pump locations, and transaction outcomes.
- View the next eligible date and scheduled refuelling slots.
- Monitor civilian and government-linked fuel-card information where applicable.

### Pump operator

- Search a vehicle by registration number.
- Run an eligibility check before dispensing.
- See the applicable civilian or government quota and the remaining amount.
- Record the requested and actually dispensed litres.
- Receive clear approved, partial, blocked, or unregistered outcomes.
- Review the station's transaction history and total dispensed volume.

### Government administrator

- View operational totals, recent activity, compliance indicators, and trends.
- Search vehicle and owner records by registration, NID, or fuel-card number.
- Inspect owner, vehicle, registration, make, model, status, and transaction data.
- Manage users and activate or deactivate accounts.
- Configure civilian distribution rules by vehicle type.
- Configure separate government quota rules by vehicle type.
- Review and filter all transactions by status and date.
- Export transaction reports for audit, taxation, and policy analysis.
- View fuel-company and station activity in aggregated reports.
- Print or verify government and civilian fuel-card records.

## Fuel-control workflow

1. The operator enters a vehicle registration number.
2. The system resolves the vehicle and its civilian or government classification.
3. The applicable rule supplies the maximum litres and restriction interval.
4. Recent approved or partial transactions are evaluated in the sliding window.
5. The operator sees whether the vehicle is eligible, the remaining quota, and
   the next eligible time when access is restricted.
6. A successful dispense is recorded centrally.
7. The system schedules the next refuelling opportunity and exposes the result
   to the vehicle owner and administrators.

Dispensing the full remaining quota closes the current cycle. Dispensing less
than the remaining quota records a partial transaction and leaves the balance
available until the restriction window ends. Blocked requests are retained as
operational outcomes without issuing fuel.

## Quota policy

Civilian defaults:

| Vehicle type | Maximum per cycle | Restriction |
|---|---:|---:|
| Motorcycle | 4 L | 3 days |
| CNG auto-rickshaw | 3 L | 2 days |
| Car | 10 L | 3 days |
| Microbus | 15 L | 3 days |
| Truck | 20 L | 2 days |
| Bus | 30 L | 2 days |

Government vehicles use a separate rule set so official, emergency, public
health, security, and other essential services can receive policy-appropriate
allocations. Administrators can change either rule set without redeploying the
application.

## Monitoring and reporting

The administrative views support:

- Daily and period-based litres dispensed.
- Transaction counts and status breakdowns.
- Vehicle-type consumption comparisons.
- Fuel-company and pump activity.
- Recent transaction review.
- Owner and vehicle lookup.
- Exportable transaction records.
- Government-vehicle and fuel-card oversight.

These records create an auditable chain from registration to dispense. They can
support reconciliation between station inventory, company allocations, tax
records, and reported consumer demand.

## Nationwide government value

### Better fuel management

Central eligibility checks reduce duplicate claims and make scarce inventory
allocations enforceable at every participating station. Configurable quotas
allow national policy to be adjusted by vehicle class, region, emergency
service, or crisis severity.

### Taxation and financial control

Time-stamped transaction records can be reconciled with station sales, company
deliveries, vehicle registrations, and applicable tax or levy records. Exports
provide a consistent evidence base for audits and anomaly investigation.

### Monitoring and accountability

Role-based access limits operational actions to authorised users. Administrators
can compare pumps, districts, vehicle types, and fuel companies, identify
unusual consumption, and follow the history of a vehicle or owner.

### Crisis control

During shortages, authorities can shorten restriction windows, revise quotas,
prioritise essential vehicle classes, and monitor the effect through live
aggregates. Government vehicles can be governed separately so emergency and
public-service operations remain visible and accountable.

### National integration

The registration, owner NID, fuel-card, pump, and transaction structures provide
integration points for BRTA records, government fleet registers, fuel-company
systems, tax systems, and national reporting infrastructure. A production
deployment should add official identity verification, high-availability
hosting, encryption and key management, backups, retention policies, audit-log
immutability, and formal access governance.

## Technical architecture

| Layer | Technology |
|---|---|
| Application | Next.js App Router |
| Language | TypeScript |
| Database access | Prisma ORM |
| Database | PostgreSQL-compatible deployment |
| Authentication | NextAuth.js credentials sessions |
| UI | Tailwind CSS and shadcn/ui components |
| Validation | Zod and shared application validators |
| Analytics | Server-side aggregation and Recharts |

The application contains server-rendered dashboards, authenticated API routes,
shared eligibility logic, database-backed scheduling, and administrative
configuration screens.

## Local setup

Requirements: Node.js 20 or later and npm.

```powershell
npm install
Copy-Item .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open `http://localhost:3000` after the development server starts. Configure
`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` in `.env`
for the selected environment. Never commit secrets or production connection
strings.

## Useful commands

```powershell
npm run dev
npm run build
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npx prisma studio
```

The seed process creates the reference vehicles, owners, pumps, users, quota
rules, fuel companies, transactions, and schedules used to exercise the
application. Update the seed source before reseeding when changing local
reference data.

## Security and operations

Use separate credentials and secrets per environment. Deploy behind HTTPS,
restrict database access, rotate authentication secrets, monitor failed logins,
and grant administrators only the permissions required for their duties. Before
national rollout, add official identity and registry integrations, independent
audit storage, rate limiting, disaster recovery, observability, accessibility
testing, and load testing for concurrent station activity.

-- Add explicit owner and fuel company foundations for the v2 demo platform.

CREATE TABLE "owners" (
    "id" TEXT NOT NULL,
    "nid" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "fuel_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startingAvailableLiters" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fuel_companies_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "vehicles"
  ADD COLUMN "ownerId" TEXT;

ALTER TABLE "operator_profiles"
  ADD COLUMN "companyId" TEXT;

ALTER TABLE "fuel_transactions"
  ADD COLUMN "companyId" TEXT;

CREATE UNIQUE INDEX "owners_nid_key" ON "owners"("nid");
CREATE UNIQUE INDEX "fuel_companies_name_key" ON "fuel_companies"("name");
CREATE INDEX "vehicles_ownerId_idx" ON "vehicles"("ownerId");
CREATE INDEX "fuel_transactions_companyId_transactedAt_idx" ON "fuel_transactions"("companyId", "transactedAt");

ALTER TABLE "vehicles"
  ADD CONSTRAINT "vehicles_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "operator_profiles"
  ADD CONSTRAINT "operator_profiles_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "fuel_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "fuel_transactions"
  ADD CONSTRAINT "fuel_transactions_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "fuel_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

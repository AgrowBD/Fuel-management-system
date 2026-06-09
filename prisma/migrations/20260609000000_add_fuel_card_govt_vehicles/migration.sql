-- Migration: add_fuel_card_govt_vehicles
-- Adds fuelCardNumber + isGovernment to vehicles, creates government_quota_rules table.

ALTER TABLE "vehicles"
  ADD COLUMN "fuelCardNumber" TEXT,
  ADD COLUMN "isGovernment" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "vehicles"
  ADD CONSTRAINT "vehicles_fuelCardNumber_key" UNIQUE ("fuelCardNumber");

CREATE TABLE "government_quota_rules" (
    "id"                  TEXT NOT NULL,
    "vehicleType"         TEXT NOT NULL,
    "maxLitersPerCycle"   DOUBLE PRECISION NOT NULL,
    "restrictionDays"     INTEGER NOT NULL,
    "description"         TEXT,
    "updatedAt"           TIMESTAMP(3) NOT NULL,
    CONSTRAINT "government_quota_rules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "government_quota_rules_vehicleType_key"
    ON "government_quota_rules"("vehicleType");

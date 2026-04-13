-- CreateTable
CREATE TABLE "brta_vehicles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "licenseNumber" TEXT NOT NULL,
    "ownerNid" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "pump_registry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tradeLicenseNo" TEXT NOT NULL,
    "pumpName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "operator_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tradeLicenseNo" TEXT NOT NULL,
    "pumpName" TEXT NOT NULL,
    "pumpAddress" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "operator_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "licenseNumber" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "ownerName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "distribution_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleType" TEXT NOT NULL,
    "maxLitersPerCycle" REAL NOT NULL,
    "restrictionDays" INTEGER NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "fuel_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "litersRequested" REAL NOT NULL,
    "litersDispensed" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "pumpName" TEXT NOT NULL,
    "pumpDistrict" TEXT NOT NULL,
    "transactedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "fuel_transactions_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fuel_transactions_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fuel_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "pumpName" TEXT NOT NULL,
    "pumpDistrict" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fuel_schedules_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "brta_vehicles_licenseNumber_key" ON "brta_vehicles"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "pump_registry_tradeLicenseNo_key" ON "pump_registry"("tradeLicenseNo");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "operator_profiles_userId_key" ON "operator_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "operator_profiles_tradeLicenseNo_key" ON "operator_profiles"("tradeLicenseNo");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_licenseNumber_key" ON "vehicles"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "distribution_rules_vehicleType_key" ON "distribution_rules"("vehicleType");

-- CreateIndex
CREATE INDEX "fuel_transactions_vehicleId_transactedAt_idx" ON "fuel_transactions"("vehicleId", "transactedAt");

-- CreateIndex
CREATE INDEX "fuel_transactions_operatorId_transactedAt_idx" ON "fuel_transactions"("operatorId", "transactedAt");

-- CreateIndex
CREATE INDEX "fuel_schedules_vehicleId_scheduledDate_idx" ON "fuel_schedules"("vehicleId", "scheduledDate");

import { addDays, differenceInCalendarDays, isBefore } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { EligibilityResult, VehicleType } from "@/types";

// Resolves the quota rule for a vehicle: GovernmentQuotaRule for govt, DistributionRule for civilian.
async function getRule(vehicleType: string, isGovernment: boolean) {
  if (isGovernment) {
    return prisma.governmentQuotaRule.findUnique({ where: { vehicleType } });
  }
  return prisma.distributionRule.findUnique({ where: { vehicleType } });
}

// Sliding-window quota check. Works for both civilian and government vehicles.
// Government vehicles use GovernmentQuotaRule; civilian use DistributionRule.
export async function checkEligibility(licenseNumber: string): Promise<EligibilityResult> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { licenseNumber: licenseNumber.trim().toUpperCase() },
  });

  if (!vehicle || !vehicle.isActive) {
    return { eligible: false, reason: "VEHICLE_NOT_REGISTERED" };
  }

  return checkEligibilityForVehicle(vehicle);
}

export async function checkEligibilityByCardNumber(cardNumber: string): Promise<EligibilityResult> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { fuelCardNumber: cardNumber.trim().toUpperCase() },
  });

  if (!vehicle || !vehicle.isActive) {
    return { eligible: false, reason: "VEHICLE_NOT_REGISTERED" };
  }

  return checkEligibilityForVehicle(vehicle);
}

export async function checkEligibilityForVehicle(vehicle: {
  id: string;
  licenseNumber: string;
  vehicleType: string;
  ownerName: string;
  isGovernment: boolean;
  fuelCardNumber: string | null;
}): Promise<EligibilityResult> {
  const rule = await getRule(vehicle.vehicleType, vehicle.isGovernment);

  if (!rule) {
    return {
      eligible: true,
      maxLiters: 10,
      vehicleType: vehicle.vehicleType as VehicleType,
      ownerName: vehicle.ownerName,
      licenseNumber: vehicle.licenseNumber,
      isGovernment: vehicle.isGovernment,
      fuelCardNumber: vehicle.fuelCardNumber,
    };
  }

  const recentTxs = await prisma.fuelTransaction.findMany({
    where: {
      vehicleId: vehicle.id,
      status: { in: ["APPROVED", "PARTIAL"] },
    },
    orderBy: { transactedAt: "desc" },
    take: 30,
  });

  if (recentTxs.length === 0) {
    return {
      eligible: true,
      maxLiters: rule.maxLitersPerCycle,
      vehicleType: vehicle.vehicleType as VehicleType,
      ownerName: vehicle.ownerName,
      licenseNumber: vehicle.licenseNumber,
      isGovernment: vehicle.isGovernment,
      fuelCardNumber: vehicle.fuelCardNumber,
    };
  }

  const cycle = [recentTxs[0]];
  for (let i = 1; i < recentTxs.length; i++) {
    const gap = differenceInCalendarDays(recentTxs[i - 1].transactedAt, recentTxs[i].transactedAt);
    if (gap < rule.restrictionDays) cycle.push(recentTxs[i]);
    else break;
  }

  const firstInCycle = cycle[cycle.length - 1];
  const cycleExpiresAt = addDays(firstInCycle.transactedAt, rule.restrictionDays);
  const now = new Date();

  if (!isBefore(now, cycleExpiresAt)) {
    return {
      eligible: true,
      maxLiters: rule.maxLitersPerCycle,
      vehicleType: vehicle.vehicleType as VehicleType,
      ownerName: vehicle.ownerName,
      licenseNumber: vehicle.licenseNumber,
      isGovernment: vehicle.isGovernment,
      fuelCardNumber: vehicle.fuelCardNumber,
    };
  }

  const usedInCycle = cycle.reduce((sum, t) => sum + t.litersDispensed, 0);
  const remaining = rule.maxLitersPerCycle - usedInCycle;

  if (remaining > 0) {
    return {
      eligible: true,
      maxLiters: remaining,
      vehicleType: vehicle.vehicleType as VehicleType,
      ownerName: vehicle.ownerName,
      licenseNumber: vehicle.licenseNumber,
      isGovernment: vehicle.isGovernment,
      fuelCardNumber: vehicle.fuelCardNumber,
    };
  }

  return {
    eligible: false,
    reason: "IN_RESTRICTION_PERIOD",
    restrictionEndsAt: cycleExpiresAt,
    lastTransactionAt: recentTxs[0].transactedAt,
    vehicleType: vehicle.vehicleType as VehicleType,
    ownerName: vehicle.ownerName,
    licenseNumber: vehicle.licenseNumber,
    isGovernment: vehicle.isGovernment,
    fuelCardNumber: vehicle.fuelCardNumber,
  };
}

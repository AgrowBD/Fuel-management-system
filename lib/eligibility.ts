import { addDays, isBefore } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { EligibilityResult, VehicleType } from "@/types";

/**
 * Checks whether a vehicle is eligible to receive fuel.
 * Returns eligibility status, max allowed liters, and restriction details if blocked.
 */
export async function checkEligibility(licenseNumber: string): Promise<EligibilityResult> {
  // 1. Look up the vehicle
  const vehicle = await prisma.vehicle.findUnique({
    where: { licenseNumber: licenseNumber.trim().toUpperCase() },
  });

  if (!vehicle || !vehicle.isActive) {
    return { eligible: false, reason: "VEHICLE_NOT_REGISTERED" };
  }

  // 2. Get the quota rule for this vehicle type
  const rule = await prisma.distributionRule.findUnique({
    where: { vehicleType: vehicle.vehicleType },
  });

  if (!rule) {
    // Fallback: no rule defined means no restriction
    return {
      eligible: true,
      maxLiters: 10,
      vehicleType: vehicle.vehicleType as VehicleType,
      ownerName: vehicle.ownerName,
      licenseNumber: vehicle.licenseNumber,
    };
  }

  // 3. Find the most recent approved/partial transaction
  const lastTransaction = await prisma.fuelTransaction.findFirst({
    where: {
      vehicleId: vehicle.id,
      status: { in: ["APPROVED", "PARTIAL"] },
    },
    orderBy: { transactedAt: "desc" },
  });

  // 4. No prior transaction → fully eligible
  if (!lastTransaction) {
    return {
      eligible: true,
      maxLiters: rule.maxLitersPerCycle,
      vehicleType: vehicle.vehicleType as VehicleType,
      ownerName: vehicle.ownerName,
      licenseNumber: vehicle.licenseNumber,
    };
  }

  // 5. Check if still within restriction window
  const restrictionEndsAt = addDays(lastTransaction.transactedAt, rule.restrictionDays);
  if (isBefore(new Date(), restrictionEndsAt)) {
    return {
      eligible: false,
      reason: "IN_RESTRICTION_PERIOD",
      restrictionEndsAt,
      lastTransactionAt: lastTransaction.transactedAt,
      vehicleType: vehicle.vehicleType as VehicleType,
      ownerName: vehicle.ownerName,
      licenseNumber: vehicle.licenseNumber,
    };
  }

  // 6. Restriction has passed → eligible
  return {
    eligible: true,
    maxLiters: rule.maxLitersPerCycle,
    vehicleType: vehicle.vehicleType as VehicleType,
    ownerName: vehicle.ownerName,
    licenseNumber: vehicle.licenseNumber,
  };
}

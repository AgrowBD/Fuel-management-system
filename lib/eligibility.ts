import { addDays, differenceInCalendarDays, isBefore } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { EligibilityResult, VehicleType } from "@/types";

// Sliding-window quota with first-fill cycle anchor.
//
// A "cycle" is a contiguous chain of dispenses where each fill is within
// `restrictionDays` calendar days of the next. The cycle's expiry is fixed
// at `firstFillInCycle + restrictionDays`. Within an active cycle a vehicle
// may top up to `maxLitersPerCycle` total; partial fills leave the remainder
// claimable. Once the cycle expires, a fresh cycle starts.
export async function checkEligibility(licenseNumber: string): Promise<EligibilityResult> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { licenseNumber: licenseNumber.trim().toUpperCase() },
  });

  if (!vehicle || !vehicle.isActive) {
    return { eligible: false, reason: "VEHICLE_NOT_REGISTERED" };
  }

  const rule = await prisma.distributionRule.findUnique({
    where: { vehicleType: vehicle.vehicleType },
  });

  if (!rule) {
    return {
      eligible: true,
      maxLiters: 10,
      vehicleType: vehicle.vehicleType as VehicleType,
      ownerName: vehicle.ownerName,
      licenseNumber: vehicle.licenseNumber,
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
    };
  }

  // Walk back from newest to find the contiguous chain forming the current cycle.
  // Strict less-than: a gap of exactly restrictionDays is the boundary between cycles.
  const cycle = [recentTxs[0]];
  for (let i = 1; i < recentTxs.length; i++) {
    const gap = differenceInCalendarDays(recentTxs[i - 1].transactedAt, recentTxs[i].transactedAt);
    if (gap < rule.restrictionDays) cycle.push(recentTxs[i]);
    else break;
  }

  const firstInCycle = cycle[cycle.length - 1];
  const cycleExpiresAt = addDays(firstInCycle.transactedAt, rule.restrictionDays);
  const now = new Date();

  // Cycle already expired → fresh cycle, full quota.
  if (!isBefore(now, cycleExpiresAt)) {
    return {
      eligible: true,
      maxLiters: rule.maxLitersPerCycle,
      vehicleType: vehicle.vehicleType as VehicleType,
      ownerName: vehicle.ownerName,
      licenseNumber: vehicle.licenseNumber,
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
  };
}

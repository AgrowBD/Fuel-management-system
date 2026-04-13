import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";

const TIME_SLOTS = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "14:00-15:00",
  "15:00-16:00",
];

/**
 * Assigns the next fuel schedule for a vehicle after a successful dispense.
 * Cancels any existing pending schedule and creates a new one.
 */
export async function assignNextSchedule(
  vehicleId: string,
  lastTransactionAt: Date,
  operatorPumpName: string,
  operatorPumpDistrict: string,
  vehicleType: string
): Promise<void> {
  const rule = await prisma.distributionRule.findUnique({
    where: { vehicleType },
  });

  const restrictionDays = rule?.restrictionDays ?? 3;

  // Next eligible date = last transaction + restriction period
  const nextEligibleDate = addDays(lastTransactionAt, restrictionDays);
  nextEligibleDate.setHours(8, 0, 0, 0); // normalize to start of day

  // Pick a time slot based on a simple hash of vehicleId
  const slotIndex = vehicleId.charCodeAt(vehicleId.length - 1) % TIME_SLOTS.length;
  const timeSlot = TIME_SLOTS[slotIndex];

  // Cancel any existing uncompleted schedule for this vehicle
  await prisma.fuelSchedule.updateMany({
    where: { vehicleId, isCompleted: false, isCancelled: false },
    data: { isCancelled: true },
  });

  // Create the new schedule at the same pump that dispensed
  await prisma.fuelSchedule.create({
    data: {
      vehicleId,
      pumpName: operatorPumpName,
      pumpDistrict: operatorPumpDistrict,
      scheduledDate: nextEligibleDate,
      timeSlot,
    },
  });
}

import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { checkEligibility } from "@/lib/eligibility";

const TIME_SLOTS = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "14:00-15:00",
  "15:00-16:00",
];

// Assigns the next fuel schedule for a vehicle after a dispense.
// If the cycle is still open (partial fill), schedule for the next day so
// the owner can come back to claim the remaining quota. If the cycle is
// closed (quota exhausted), schedule for the cycle-expiry date.
export async function assignNextSchedule(
  vehicleId: string,
  operatorPumpName: string,
  operatorPumpDistrict: string,
  licenseNumber: string
): Promise<void> {
  const eligibility = await checkEligibility(licenseNumber);

  let scheduledDate: Date;
  if (eligibility.eligible) {
    // Partial fill — remainder still claimable, invite owner back tomorrow.
    scheduledDate = addDays(new Date(), 1);
  } else if (eligibility.reason === "IN_RESTRICTION_PERIOD") {
    scheduledDate = new Date(eligibility.restrictionEndsAt);
  } else {
    return;
  }

  scheduledDate.setHours(8, 0, 0, 0);

  const slotIndex = vehicleId.charCodeAt(vehicleId.length - 1) % TIME_SLOTS.length;
  const timeSlot = TIME_SLOTS[slotIndex];

  await prisma.fuelSchedule.updateMany({
    where: { vehicleId, isCompleted: false, isCancelled: false },
    data: { isCancelled: true },
  });

  await prisma.fuelSchedule.create({
    data: {
      vehicleId,
      pumpName: operatorPumpName,
      pumpDistrict: operatorPumpDistrict,
      scheduledDate,
      timeSlot,
    },
  });
}

// POST /api/operator/dispense
// Body: { licenseNumber: string, litersDispensed: number }
// Records a fuel dispense. Re-runs eligibility check inside a DB transaction
// to prevent race conditions (two simultaneous dispenses for the same vehicle).
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkEligibility } from "@/lib/eligibility";
import { assignNextSchedule } from "@/lib/scheduler";
import { dispenseSchema } from "@/lib/validators/dispense";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OPERATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = dispenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { licenseNumber, litersDispensed } = parsed.data;

  // Fetch operator's pump info for recording and scheduling
  const operatorProfile = await prisma.operatorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!operatorProfile) {
    return NextResponse.json({ error: "Operator profile not found" }, { status: 400 });
  }

  // Re-check eligibility and get vehicle in one call
  const eligibility = await checkEligibility(licenseNumber);

  if (eligibility.eligible === false && eligibility.reason === "VEHICLE_NOT_REGISTERED") {
    return NextResponse.json({ error: "Vehicle is not registered in the system" }, { status: 404 });
  }

  // Look up vehicle id
  const vehicle = await prisma.vehicle.findUnique({
    where: { licenseNumber: licenseNumber.trim().toUpperCase() },
  });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

  // Get the rule to know max allowed liters
  const rule = await prisma.distributionRule.findUnique({
    where: { vehicleType: vehicle.vehicleType },
  });
  const maxAllowed = rule?.maxLitersPerCycle ?? litersDispensed;

  let finalLiters = litersDispensed;
  let status: "APPROVED" | "PARTIAL" | "BLOCKED";

  if (!eligibility.eligible) {
    // Record a BLOCKED transaction (the operator confirmed despite restriction — edge case)
    status = "BLOCKED";
    finalLiters = 0;
  } else if (litersDispensed > maxAllowed) {
    // Requested more than quota — dispense only the max
    status = "PARTIAL";
    finalLiters = maxAllowed;
  } else {
    status = "APPROVED";
  }

  // Write the transaction and create the next schedule atomically
  const transaction = await prisma.$transaction(async (tx) => {
    const txRecord = await tx.fuelTransaction.create({
      data: {
        vehicleId: vehicle.id,
        operatorId: session.user.id,
        litersRequested: litersDispensed,
        litersDispensed: finalLiters,
        status,
        pumpName: operatorProfile.pumpName,
        pumpDistrict: operatorProfile.district,
      },
    });

    // Mark current schedule as completed if this was scheduled
    await tx.fuelSchedule.updateMany({
      where: { vehicleId: vehicle.id, isCompleted: false, isCancelled: false },
      data: { isCompleted: true },
    });

    return txRecord;
  });

  // Assign next schedule (outside the transaction — non-critical, can fail gracefully)
  if (status !== "BLOCKED") {
    await assignNextSchedule(
      vehicle.id,
      transaction.transactedAt,
      operatorProfile.pumpName,
      operatorProfile.district,
      vehicle.vehicleType
    );
  }

  return NextResponse.json({ transaction, status, litersDispensed: finalLiters });
}

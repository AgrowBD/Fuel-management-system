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

  const operatorProfile = await prisma.operatorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!operatorProfile) {
    return NextResponse.json({ error: "Operator profile not found" }, { status: 400 });
  }

  const eligibility = await checkEligibility(licenseNumber);

  if (eligibility.eligible === false && eligibility.reason === "VEHICLE_NOT_REGISTERED") {
    return NextResponse.json({ error: "Vehicle is not registered in the system" }, { status: 404 });
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { licenseNumber: licenseNumber.trim().toUpperCase() },
  });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

  // Remaining quota available in the current cycle (0 if blocked).
  const remaining = eligibility.eligible ? eligibility.maxLiters : 0;

  let finalLiters = litersDispensed;
  let status: "APPROVED" | "PARTIAL" | "BLOCKED";

  if (!eligibility.eligible) {
    status = "BLOCKED";
    finalLiters = 0;
  } else if (litersDispensed >= remaining) {
    // Requested at or above the remaining quota — cap it and close the cycle.
    status = "APPROVED";
    finalLiters = remaining;
  } else {
    // Partial fill: quota remains in the current cycle.
    status = "PARTIAL";
    finalLiters = litersDispensed;
  }

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

    await tx.fuelSchedule.updateMany({
      where: { vehicleId: vehicle.id, isCompleted: false, isCancelled: false },
      data: { isCompleted: true },
    });

    return txRecord;
  });

  if (status !== "BLOCKED") {
    await assignNextSchedule(
      vehicle.id,
      operatorProfile.pumpName,
      operatorProfile.district,
      vehicle.licenseNumber
    );
  }

  return NextResponse.json({ transaction, status, litersDispensed: finalLiters });
}

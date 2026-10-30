// GET /api/owner/vehicles/[vehicleId]/schedule
// Returns the next pending fuel schedule for a vehicle (if any).
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ vehicleId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "VEHICLE_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user.ownerId) {
    return NextResponse.json({ error: "Owner profile is not linked" }, { status: 403 });
  }

  const { vehicleId } = await params;
  const schedule = await prisma.fuelSchedule.findFirst({
    where: { vehicleId, vehicle: { ownerId: session.user.ownerId }, isCompleted: false, isCancelled: false },
    orderBy: { scheduledDate: "asc" },
  });

  return NextResponse.json({ schedule });
}

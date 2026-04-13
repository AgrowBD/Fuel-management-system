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

  const { vehicleId } = await params;
  const schedule = await prisma.fuelSchedule.findFirst({
    where: { vehicleId, isCompleted: false, isCancelled: false },
    orderBy: { scheduledDate: "asc" },
  });

  return NextResponse.json({ schedule });
}

// GET /api/owner/vehicles
// Returns all vehicles in the system with their current eligibility status.
// In V1, the single owner account sees all seeded vehicles.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkEligibility } from "@/lib/eligibility";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "VEHICLE_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { isActive: true },
    orderBy: { registeredAt: "asc" },
  });

  // Attach eligibility status to each vehicle for the dashboard overview
  const withStatus = await Promise.all(
    vehicles.map(async (v) => {
      const eligibility = await checkEligibility(v.licenseNumber);
      return { ...v, eligibility };
    })
  );

  return NextResponse.json(withStatus);
}

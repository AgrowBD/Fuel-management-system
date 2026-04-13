// GET /api/owner/vehicles/[vehicleId]/status
// Returns current eligibility status for a single vehicle.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkEligibility } from "@/lib/eligibility";

export async function GET(_req: Request, { params }: { params: Promise<{ vehicleId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "VEHICLE_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vehicleId } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

  const eligibility = await checkEligibility(vehicle.licenseNumber);
  return NextResponse.json({ vehicle, eligibility });
}

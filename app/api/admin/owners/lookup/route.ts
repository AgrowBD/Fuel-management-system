// GET /api/admin/owners/lookup?nid=0000000000 or ?licenseNumber=DHA-GA-11-1001
// Admin-only owner lookup by NID or vehicle registration.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ownerLookupSchema } from "@/lib/validators/vehicles";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = new URL(req.url).searchParams;
  const nid = searchParams.get("nid") ?? "";
  const licenseNumber = searchParams.get("licenseNumber")?.trim().toUpperCase() ?? "";
  let owner;

  if (licenseNumber) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { licenseNumber },
      select: { owner: { select: { id: true, fullName: true, isActive: true } } },
    });
    owner = vehicle?.owner;
  } else {
    const parsed = ownerLookupSchema.safeParse({ nid });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    owner = await prisma.owner.findUnique({
      where: { nid: parsed.data.nid },
      select: { id: true, fullName: true, isActive: true },
    });
  }

  const ownerWithVehicles = owner && await prisma.owner.findUnique({
    where: { id: owner.id },
    select: {
      id: true,
      fullName: true,
      isActive: true,
      vehicles: {
        where: { isActive: true },
        orderBy: { registeredAt: "asc" },
        select: { id: true, licenseNumber: true, vehicleType: true, make: true, model: true, year: true },
      },
    },
  });

  if (!ownerWithVehicles || !ownerWithVehicles.isActive) {
    return NextResponse.json({ error: licenseNumber ? "No active owner found for this vehicle" : "No active owner found for this NID" }, { status: 404 });
  }

  return NextResponse.json(ownerWithVehicles);
}
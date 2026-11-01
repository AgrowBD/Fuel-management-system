// POST /api/admin/vehicles
// Admin-only creation of a vehicle linked to an existing owner.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createVehicleSchema } from "@/lib/validators/vehicles";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createVehicleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const input = parsed.data;
  const owner = await prisma.owner.findUnique({ where: { nid: input.ownerNid } });
  if (!owner || !owner.isActive) {
    return NextResponse.json({ error: "No active owner found for this NID" }, { status: 404 });
  }

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        ownerId: owner.id,
        ownerName: owner.fullName,
        licenseNumber: input.licenseNumber.trim().toUpperCase(),
        vehicleType: input.vehicleType.trim().toUpperCase(),
        make: input.make.trim(),
        model: input.model.trim(),
        year: input.year,
        isGovernment: input.isGovernment,
        fuelCardNumber: input.fuelCardNumber?.trim().toUpperCase() || null,
      },
      select: { id: true, licenseNumber: true, vehicleType: true, make: true, model: true, year: true, ownerName: true },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A vehicle or fuel card with that number already exists" }, { status: 409 });
    }
    throw error;
  }
}
// GET /api/admin/vehicles/lookup?cardNumber=FC-GOVT-0001
// Admin-only: resolve a vehicle by fuel card number for card printing.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cardNumber = searchParams.get("cardNumber");
  if (!cardNumber) {
    return NextResponse.json({ error: "cardNumber is required" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { fuelCardNumber: cardNumber.trim().toUpperCase() },
    select: {
      licenseNumber: true,
      vehicleType: true,
      make: true,
      model: true,
      fuelCardNumber: true,
      isGovernment: true,
      isActive: true,
    },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "No vehicle found with that card number" }, { status: 404 });
  }

  return NextResponse.json(vehicle);
}

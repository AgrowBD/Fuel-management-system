// GET /api/operator/lookup?plate=DHA-GA-11-1001
// GET /api/operator/lookup?cardNumber=FC-GOVT-0001
// Resolves a vehicle by license plate or fuel card number and returns eligibility.
// Designed for easy future integration with YOLO plate detection (just pass ?plate=<detected>).
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkEligibilityForVehicle } from "@/lib/eligibility";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OPERATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const plate = searchParams.get("plate");
  const cardNumber = searchParams.get("cardNumber");

  if (!plate && !cardNumber) {
    return NextResponse.json({ error: "Provide plate or cardNumber" }, { status: 400 });
  }

  const vehicle = plate
    ? await prisma.vehicle.findUnique({ where: { licenseNumber: plate.trim().toUpperCase() } })
    : await prisma.vehicle.findUnique({ where: { fuelCardNumber: cardNumber!.trim().toUpperCase() } });

  if (!vehicle || !vehicle.isActive) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  const eligibility = await checkEligibilityForVehicle(vehicle);
  return NextResponse.json({ vehicle, eligibility });
}

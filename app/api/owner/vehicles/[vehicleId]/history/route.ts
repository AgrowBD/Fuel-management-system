// GET /api/owner/vehicles/[vehicleId]/history?page=1&limit=10
// Returns paginated fuel transaction history for a vehicle.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ vehicleId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "VEHICLE_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vehicleId } = await params;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "10"));
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.fuelTransaction.findMany({
      where: { vehicleId },
      orderBy: { transactedAt: "desc" },
      skip,
      take: limit,
      include: { operator: { select: { fullName: true } } },
    }),
    prisma.fuelTransaction.count({ where: { vehicleId } }),
  ]);

  return NextResponse.json({ transactions, total, page, limit });
}

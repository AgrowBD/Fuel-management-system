// GET /api/admin/stats/by-vehicle-type?days=7
// Returns total liters dispensed per vehicle type over the last N days.
// Used for the bar chart on the admin overview.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";
import { VehicleTypeLabel } from "@/types";
import type { VehicleType } from "@/types";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "7");
  const since = subDays(new Date(), days);

  // Get all transactions in range with their vehicle type
  const transactions = await prisma.fuelTransaction.findMany({
    where: {
      transactedAt: { gte: since },
      status: { in: ["APPROVED", "PARTIAL"] },
    },
    include: { vehicle: { select: { vehicleType: true } } },
  });

  // Aggregate by vehicle type
  const totals: Record<string, number> = {};
  for (const t of transactions) {
    const vt = t.vehicle.vehicleType;
    totals[vt] = (totals[vt] ?? 0) + t.litersDispensed;
  }

  const data = Object.entries(totals).map(([type, liters]) => ({
    type,
    label: VehicleTypeLabel[type as VehicleType] ?? type,
    liters: Math.round(liters * 10) / 10,
  }));

  return NextResponse.json(data);
}

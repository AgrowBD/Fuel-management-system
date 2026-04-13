// GET /api/admin/stats/overview
// Returns high-level stats for the admin dashboard header cards.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStart = startOfDay(new Date());

  const [
    totalVehicles,
    totalUsers,
    todayTransactions,
    activeRestrictions,
    recentTransactions,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.fuelTransaction.aggregate({
      _count: true,
      _sum: { litersDispensed: true },
      where: { transactedAt: { gte: todayStart } },
    }),
    // Vehicles that received fuel and are still within their restriction window
    // We approximate: count vehicles with a recent APPROVED/PARTIAL transaction
    prisma.fuelTransaction.groupBy({
      by: ["vehicleId"],
      where: {
        status: { in: ["APPROVED", "PARTIAL"] },
        transactedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    // 5 most recent transactions for the overview table
    prisma.fuelTransaction.findMany({
      take: 5,
      orderBy: { transactedAt: "desc" },
      include: {
        vehicle: { select: { licenseNumber: true, vehicleType: true } },
        operator: { select: { fullName: true } },
      },
    }),
  ]);

  return NextResponse.json({
    totalVehicles,
    totalUsers,
    transactionsToday: todayTransactions._count,
    litersDispensedToday: todayTransactions._sum.litersDispensed ?? 0,
    activeRestrictions: activeRestrictions.length,
    recentTransactions,
  });
}

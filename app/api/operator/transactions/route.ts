// GET /api/operator/transactions?period=today|week
// Returns this operator's dispensing history.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfBangladeshDay, startOfBangladeshWeek } from "@/lib/bangladesh-time";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OPERATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "today";

  const since = period === "week"
    ? startOfBangladeshWeek(new Date(), 6)
    : startOfBangladeshDay();

  const transactions = await prisma.fuelTransaction.findMany({
    where: {
      operatorId: session.user.id,
      transactedAt: { gte: since },
    },
    orderBy: { transactedAt: "desc" },
    include: {
      vehicle: { select: { licenseNumber: true, vehicleType: true, ownerName: true } },
    },
  });

  const totalLiters = transactions.reduce((sum, t) => sum + t.litersDispensed, 0);

  return NextResponse.json({ transactions, totalLiters });
}

// GET /api/admin/transactions?page=1&limit=20&vehicleType=&status=&from=&to=
// Returns all transactions with filters. Used for the admin transactions table.
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
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));
  const skip = (page - 1) * limit;
  const vehicleType = searchParams.get("vehicleType") ?? "";
  const status = searchParams.get("status") ?? "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (from || to) {
    where.transactedAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }
  if (vehicleType) {
    where.vehicle = { vehicleType };
  }

  const [transactions, total] = await Promise.all([
    prisma.fuelTransaction.findMany({
      where,
      orderBy: { transactedAt: "desc" },
      skip,
      take: limit,
      include: {
        vehicle: { select: { licenseNumber: true, vehicleType: true, ownerName: true } },
        operator: { select: { fullName: true } },
      },
    }),
    prisma.fuelTransaction.count({ where }),
  ]);

  return NextResponse.json({ transactions, total, page, limit });
}

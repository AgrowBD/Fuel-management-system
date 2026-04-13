// GET /api/admin/reports/export?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns a CSV file of all transactions in the date range.
// Built manually — no CSV library needed for this simple export.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const transactions = await prisma.fuelTransaction.findMany({
    where: {
      ...(from || to
        ? {
            transactedAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to + "T23:59:59") } : {}),
            },
          }
        : {}),
    },
    orderBy: { transactedAt: "desc" },
    include: {
      vehicle: { select: { licenseNumber: true, vehicleType: true, ownerName: true } },
      operator: { select: { fullName: true } },
    },
  });

  const headers = [
    "Date",
    "Time",
    "License Number",
    "Vehicle Type",
    "Owner Name",
    "Liters Requested",
    "Liters Dispensed",
    "Status",
    "Pump Name",
    "District",
    "Operator",
  ];

  const rows = transactions.map((t) => [
    format(t.transactedAt, "yyyy-MM-dd"),
    format(t.transactedAt, "HH:mm"),
    t.vehicle.licenseNumber,
    t.vehicle.vehicleType,
    t.vehicle.ownerName,
    t.litersRequested,
    t.litersDispensed,
    t.status,
    t.pumpName,
    t.pumpDistrict,
    t.operator.fullName,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const filename = `fuel-report-${format(new Date(), "yyyy-MM-dd")}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

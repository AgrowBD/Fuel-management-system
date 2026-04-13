// GET /api/admin/rules
// Returns all distribution rules (one per vehicle type).
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rules = await prisma.distributionRule.findMany({ orderBy: { vehicleType: "asc" } });
  return NextResponse.json(rules);
}

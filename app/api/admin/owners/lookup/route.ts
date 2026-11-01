// GET /api/admin/owners/lookup?nid=0000000000
// Admin-only owner lookup. The NID is used for lookup but never returned.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ownerLookupSchema } from "@/lib/validators/vehicles";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nid = new URL(req.url).searchParams.get("nid") ?? "";
  const parsed = ownerLookupSchema.safeParse({ nid });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const owner = await prisma.owner.findUnique({
    where: { nid: parsed.data.nid },
    select: {
      id: true,
      fullName: true,
      isActive: true,
      vehicles: {
        where: { isActive: true },
        orderBy: { registeredAt: "asc" },
        select: { id: true, licenseNumber: true, vehicleType: true, make: true, model: true, year: true },
      },
    },
  });

  if (!owner || !owner.isActive) {
    return NextResponse.json({ error: "No active owner found for this NID" }, { status: 404 });
  }

  return NextResponse.json(owner);
}
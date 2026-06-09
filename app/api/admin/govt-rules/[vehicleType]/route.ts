// PATCH /api/admin/govt-rules/[vehicleType]
// Body: { maxLitersPerCycle: number, restrictionDays: number, description?: string }
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateRuleSchema } from "@/lib/validators/rules";

export async function PATCH(req: Request, { params }: { params: Promise<{ vehicleType: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vehicleType } = await params;
  const body = await req.json();
  const parsed = updateRuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const rule = await prisma.governmentQuotaRule.update({
    where: { vehicleType },
    data: parsed.data,
  });

  return NextResponse.json(rule);
}

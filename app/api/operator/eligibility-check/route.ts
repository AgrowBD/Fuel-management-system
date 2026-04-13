// POST /api/operator/eligibility-check
// Body: { licenseNumber: string }
// Checks whether a vehicle is eligible for fuel without recording a transaction.
// Called by the operator before confirming a dispense.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkEligibility } from "@/lib/eligibility";
import { eligibilityCheckSchema } from "@/lib/validators/dispense";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OPERATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = eligibilityCheckSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const result = await checkEligibility(parsed.data.licenseNumber);
  return NextResponse.json(result);
}

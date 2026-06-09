import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Wakes the Neon compute before the user submits credentials.
// Called silently from the login page on mount — fire-and-forget.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}

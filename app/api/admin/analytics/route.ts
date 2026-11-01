import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnalyticsData } from "@/lib/analytics";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = new URL(req.url).searchParams;
  const mode = searchParams.get("mode") === "real" ? "real" : "demo";
  const requestedDays = Number(searchParams.get("days") ?? "30");
  const days = Number.isFinite(requestedDays) ? Math.min(90, Math.max(7, Math.floor(requestedDays))) : 30;

  const data = await getAnalyticsData(mode, days);
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

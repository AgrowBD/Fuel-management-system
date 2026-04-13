// Admin overview page: headline stats + vehicle-type chart + recent transactions.
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";
import { format } from "date-fns";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FuelByTypeChart } from "@/components/charts/FuelByTypeChart";
import { VehicleTypeLabel } from "@/types";
import type { VehicleType } from "@/types";

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const todayStart = startOfDay(new Date());

  const [totalVehicles, totalUsers, todayAgg, recentTransactions] = await Promise.all([
    prisma.vehicle.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.fuelTransaction.aggregate({
      _count: true,
      _sum: { litersDispensed: true },
      where: { transactedAt: { gte: todayStart } },
    }),
    prisma.fuelTransaction.findMany({
      take: 8,
      orderBy: { transactedAt: "desc" },
      include: {
        vehicle: { select: { licenseNumber: true, vehicleType: true } },
        operator: { select: { fullName: true } },
      },
    }),
  ]);

  const litersToday = todayAgg._sum.litersDispensed ?? 0;

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Admin Overview" />
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Registered Vehicles" value={totalVehicles} />
          <StatCard label="Active Users" value={totalUsers} />
          <StatCard label="Transactions Today" value={todayAgg._count} />
          <StatCard label="Liters Dispensed Today" value={`${litersToday.toFixed(1)}L`} accent="green" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Fuel by Vehicle Type (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <FuelByTypeChart />
            </CardContent>
          </Card>

          {/* Recent transactions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No transactions yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentTransactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-mono font-medium">{t.vehicle.licenseNumber}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          {VehicleTypeLabel[t.vehicle.vehicleType as VehicleType]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs">
                          {format(new Date(t.transactedAt), "HH:mm")}
                        </span>
                        <span className="font-medium">{t.litersDispensed}L</span>
                        <Badge
                          variant={t.status === "BLOCKED" ? "destructive" : t.status === "PARTIAL" ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

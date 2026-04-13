// Owner fuel history page: paginated transaction history across all vehicles.
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VehicleTypeLabel } from "@/types";
import type { VehicleType } from "@/types";

const STATUS_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  APPROVED: "default",
  BLOCKED: "destructive",
  PARTIAL: "secondary",
};

export default async function OwnerHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "VEHICLE_OWNER") redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const limit = 15;
  const skip = (page - 1) * limit;

  // Get all vehicle ids first
  const vehicles = await prisma.vehicle.findMany({ select: { id: true } });
  const vehicleIds = vehicles.map((v) => v.id);

  const [transactions, total] = await Promise.all([
    prisma.fuelTransaction.findMany({
      where: { vehicleId: { in: vehicleIds } },
      orderBy: { transactedAt: "desc" },
      skip,
      take: limit,
      include: {
        vehicle: { select: { licenseNumber: true, vehicleType: true, ownerName: true } },
        operator: { select: { fullName: true } },
      },
    }),
    prisma.fuelTransaction.count({ where: { vehicleId: { in: vehicleIds } } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Fuel History" />
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">All Transactions</CardTitle>
              <span className="text-sm text-muted-foreground">{total} total</span>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No transactions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Date & Time</th>
                      <th className="pb-2 pr-4 font-medium">License</th>
                      <th className="pb-2 pr-4 font-medium">Type</th>
                      <th className="pb-2 pr-4 font-medium">Pump</th>
                      <th className="pb-2 pr-4 font-medium">Liters</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transactions.map((t) => (
                      <tr key={t.id}>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {format(new Date(t.transactedAt), "dd MMM yyyy, HH:mm")}
                        </td>
                        <td className="py-2.5 pr-4 font-mono font-medium">{t.vehicle.licenseNumber}</td>
                        <td className="py-2.5 pr-4">
                          {VehicleTypeLabel[t.vehicle.vehicleType as VehicleType] ?? t.vehicle.vehicleType}
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">{t.pumpName}</td>
                        <td className="py-2.5 pr-4">{t.litersDispensed}L</td>
                        <td className="py-2.5">
                          <Badge variant={STATUS_VARIANT[t.status] ?? "secondary"} className="text-xs">
                            {t.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  {page > 1 && (
                    <a href={`?page=${page - 1}`} className="hover:text-foreground">← Previous</a>
                  )}
                  {page < totalPages && (
                    <a href={`?page=${page + 1}`} className="hover:text-foreground">Next →</a>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

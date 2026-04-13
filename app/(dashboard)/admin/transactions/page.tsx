// Admin transactions page: filterable table of all fuel transactions.
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VehicleTypeLabel, VehicleType } from "@/types";

const STATUS_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  APPROVED: "default",
  BLOCKED: "destructive",
  PARTIAL: "secondary",
};

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; vehicleType?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const limit = 20;
  const skip = (page - 1) * limit;
  const statusFilter = params.status ?? "";
  const typeFilter = params.vehicleType ?? "";

  const where: Record<string, unknown> = {};
  if (statusFilter) where.status = statusFilter;
  if (typeFilter) where.vehicle = { vehicleType: typeFilter };

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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col h-full">
      <Topbar title="All Transactions" />
      <div className="flex-1 p-4 md:p-6 space-y-4">

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-muted-foreground">{total} transactions</span>
          <div className="flex gap-2 flex-wrap">
            {["", "APPROVED", "PARTIAL", "BLOCKED"].map((s) => (
              <a
                key={s}
                href={`?status=${s}&vehicleType=${typeFilter}`}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {s || "All Status"}
              </a>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {["", ...Object.keys(VehicleType)].map((vt) => (
              <a
                key={vt}
                href={`?status=${statusFilter}&vehicleType=${vt}`}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  typeFilter === vt
                    ? "bg-primary text-primary-foreground border-primary"
                    : "text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {vt ? VehicleTypeLabel[vt as VehicleType] : "All Types"}
              </a>
            ))}
          </div>
          <a
            href={`/api/admin/reports/export`}
            className="ml-auto text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Export CSV
          </a>
        </div>

        <Card>
          <CardContent className="pt-4">
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
                      <th className="pb-2 pr-4 font-medium">Owner</th>
                      <th className="pb-2 pr-4 font-medium">Requested</th>
                      <th className="pb-2 pr-4 font-medium">Dispensed</th>
                      <th className="pb-2 pr-4 font-medium">Pump</th>
                      <th className="pb-2 pr-4 font-medium">Operator</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transactions.map((t) => (
                      <tr key={t.id}>
                        <td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
                          {format(new Date(t.transactedAt), "dd MMM, HH:mm")}
                        </td>
                        <td className="py-2.5 pr-4 font-mono font-medium">{t.vehicle.licenseNumber}</td>
                        <td className="py-2.5 pr-4 whitespace-nowrap">
                          {VehicleTypeLabel[t.vehicle.vehicleType as VehicleType] ?? t.vehicle.vehicleType}
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">{t.vehicle.ownerName}</td>
                        <td className="py-2.5 pr-4">{t.litersRequested}L</td>
                        <td className="py-2.5 pr-4 font-medium">{t.litersDispensed}L</td>
                        <td className="py-2.5 pr-4 text-muted-foreground">{t.pumpName}</td>
                        <td className="py-2.5 pr-4 text-muted-foreground">{t.operator.fullName}</td>
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-3">
                  {page > 1 && <a href={`?page=${page - 1}&status=${statusFilter}&vehicleType=${typeFilter}`} className="hover:text-foreground">← Previous</a>}
                  {page < totalPages && <a href={`?page=${page + 1}&status=${statusFilter}&vehicleType=${typeFilter}`} className="hover:text-foreground">Next →</a>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

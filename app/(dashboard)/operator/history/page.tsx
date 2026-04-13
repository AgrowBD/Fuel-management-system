"use client";
// Operator history page: shows today's and this week's dispensing activity.
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleTypeLabel } from "@/types";
import type { VehicleType } from "@/types";

type Transaction = {
  id: string;
  litersDispensed: number;
  litersRequested: number;
  status: string;
  pumpName: string;
  transactedAt: string;
  vehicle: { licenseNumber: string; vehicleType: string; ownerName: string };
};

const statusVariant: Record<string, "default" | "destructive" | "secondary"> = {
  APPROVED: "default",
  BLOCKED: "destructive",
  PARTIAL: "secondary",
};

function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">No transactions found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Time</th>
            <th className="pb-2 pr-4 font-medium">License</th>
            <th className="pb-2 pr-4 font-medium">Type</th>
            <th className="pb-2 pr-4 font-medium">Owner</th>
            <th className="pb-2 pr-4 font-medium">Liters</th>
            <th className="pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {transactions.map((t) => (
            <tr key={t.id}>
              <td className="py-2.5 pr-4 text-muted-foreground">
                {format(new Date(t.transactedAt), "HH:mm")}
              </td>
              <td className="py-2.5 pr-4 font-mono font-medium">{t.vehicle.licenseNumber}</td>
              <td className="py-2.5 pr-4">{VehicleTypeLabel[t.vehicle.vehicleType as VehicleType] ?? t.vehicle.vehicleType}</td>
              <td className="py-2.5 pr-4 text-muted-foreground">{t.vehicle.ownerName}</td>
              <td className="py-2.5 pr-4">{t.litersDispensed}L</td>
              <td className="py-2.5">
                <Badge variant={statusVariant[t.status] ?? "secondary"} className="text-xs">
                  {t.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function OperatorHistoryPage() {
  const [period, setPeriod] = useState<"today" | "week">("today");
  const [data, setData] = useState<{ transactions: Transaction[]; totalLiters: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/operator/transactions?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Today's Activity" />
      <div className="flex-1 p-4 md:p-6 space-y-6">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as "today" | "week")}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
            </TabsList>
            {data && (
              <span className="text-sm text-muted-foreground">
                Total dispensed: <span className="font-semibold text-foreground">{data.totalLiters}L</span>
              </span>
            )}
          </div>

          <TabsContent value={period} className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {period === "today" ? "Today's transactions" : "This week's transactions"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : (
                  <TransactionTable transactions={data?.transactions ?? []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

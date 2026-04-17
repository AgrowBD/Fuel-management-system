// Vehicle owner overview page.
// Shows all owned vehicles with their current eligibility status.
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { checkEligibility } from "@/lib/eligibility";
import { format } from "date-fns";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VehicleTypeLabel } from "@/types";
import type { VehicleType } from "@/types";

export default async function OwnerOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "VEHICLE_OWNER") redirect("/login");

  const vehicles = await prisma.vehicle.findMany({
    where: { isActive: true, ownerName: session.user.name },
    orderBy: { registeredAt: "asc" },
  });

  const vehiclesWithStatus = await Promise.all(
    vehicles.map(async (v) => {
      const eligibility = await checkEligibility(v.licenseNumber);

      // Get the last transaction for this vehicle
      const lastTx = await prisma.fuelTransaction.findFirst({
        where: { vehicleId: v.id, status: { in: ["APPROVED", "PARTIAL"] } },
        orderBy: { transactedAt: "desc" },
      });

      // Get next schedule
      const schedule = await prisma.fuelSchedule.findFirst({
        where: { vehicleId: v.id, isCompleted: false, isCancelled: false },
        orderBy: { scheduledDate: "asc" },
      });

      return { vehicle: v, eligibility, lastTx, schedule };
    })
  );

  const eligibleCount = vehiclesWithStatus.filter((v) => v.eligibility.eligible).length;
  const restrictedCount = vehiclesWithStatus.length - eligibleCount;

  return (
    <div className="flex flex-col h-full">
      <Topbar title="My Vehicles" />
      <div className="flex-1 p-4 md:p-6 space-y-6">

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Registered Vehicles" value={vehicles.length} />
          <StatCard label="Eligible for Fuel" value={eligibleCount} accent="green" />
          <StatCard label="In Restriction" value={restrictedCount} accent={restrictedCount > 0 ? "amber" : "default"} />
        </div>

        {/* Vehicle cards */}
        <div className="grid gap-4">
          {vehiclesWithStatus.map(({ vehicle, eligibility, lastTx, schedule }) => (
            <Card key={vehicle.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-mono">{vehicle.licenseNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {vehicle.year} {vehicle.make} {vehicle.model} · {VehicleTypeLabel[vehicle.vehicleType as VehicleType]}
                    </p>
                  </div>
                  <Badge
                    variant={eligibility.eligible ? "default" : "destructive"}
                    className={eligibility.eligible ? "bg-green-600 text-white" : ""}
                  >
                    {eligibility.eligible ? "Eligible" : "Restricted"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Owner</p>
                    <p className="font-medium">{vehicle.ownerName}</p>
                  </div>

                  {eligibility.eligible ? (
                    <div>
                      <p className="text-muted-foreground text-xs">Can receive</p>
                      <p className="font-medium text-green-600">{eligibility.maxLiters}L</p>
                    </div>
                  ) : eligibility.reason === "IN_RESTRICTION_PERIOD" ? (
                    <div>
                      <p className="text-muted-foreground text-xs">Eligible from</p>
                      <p className="font-medium text-amber-600">
                        {format(new Date(eligibility.restrictionEndsAt), "dd MMM, HH:mm")}
                      </p>
                    </div>
                  ) : null}

                  <div>
                    <p className="text-muted-foreground text-xs">Last fuelled</p>
                    <p className="font-medium">
                      {lastTx ? format(new Date(lastTx.transactedAt), "dd MMM yyyy") : "Never"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs">Next schedule</p>
                    <p className="font-medium">
                      {schedule
                        ? `${format(new Date(schedule.scheduledDate), "dd MMM")} · ${schedule.timeSlot}`
                        : "Not assigned"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

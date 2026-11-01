import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkEligibility } from "@/lib/eligibility";
import { formatBangladeshDate } from "@/lib/bangladesh-time";
import { getSessionOwnerId } from "@/lib/owner-access";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VehicleTypeLabel } from "@/types";
import type { VehicleType } from "@/types";

export default async function OwnerStatusPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "VEHICLE_OWNER") redirect("/login");

  const ownerId = await getSessionOwnerId(session);
  if (!ownerId) redirect("/login");

  const vehicles = await prisma.vehicle.findMany({
    where: { isActive: true, ownerId },
    orderBy: { registeredAt: "asc" },
  });

  const statuses = await Promise.all(
    vehicles.map(async (vehicle) => ({
      vehicle,
      eligibility: await checkEligibility(vehicle.licenseNumber),
    }))
  );
  const eligibleCount = statuses.filter(({ eligibility }) => eligibility.eligible).length;

  return (
    <div className="flex h-full flex-col">
      <Topbar title="Vehicle Status" />
      <div className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Registered Vehicles" value={vehicles.length} />
          <StatCard label="Eligible for Fuel" value={eligibleCount} accent="green" />
          <StatCard label="In Restriction" value={vehicles.length - eligibleCount} accent={vehicles.length > eligibleCount ? "amber" : "default"} />
        </div>

        <div className="grid gap-4">
          {statuses.map(({ vehicle, eligibility }) => (
            <Card key={vehicle.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="font-mono text-base">{vehicle.licenseNumber}</CardTitle>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {vehicle.year} {vehicle.make} {vehicle.model} · {VehicleTypeLabel[vehicle.vehicleType as VehicleType] ?? vehicle.vehicleType}
                    </p>
                  </div>
                  <Badge variant={eligibility.eligible ? "default" : "destructive"} className={eligibility.eligible ? "bg-green-600 text-white" : ""}>
                    {eligibility.eligible ? "Eligible" : "Restricted"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm">
                {eligibility.eligible ? (
                  <p className="text-green-600">Can receive up to {eligibility.maxLiters}L</p>
                ) : eligibility.reason === "IN_RESTRICTION_PERIOD" ? (
                  <p className="text-amber-600">
                    Eligible from {formatBangladeshDate(eligibility.restrictionEndsAt, "dd MMM yyyy, HH:mm")}
                  </p>
                ) : (
                  <p className="text-muted-foreground">Vehicle is not currently eligible.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

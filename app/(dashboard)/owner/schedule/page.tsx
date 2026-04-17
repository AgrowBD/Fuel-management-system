// Owner schedule page: shows all upcoming fuel schedules for all vehicles.
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format, isPast } from "date-fns";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VehicleTypeLabel } from "@/types";
import type { VehicleType } from "@/types";

export default async function OwnerSchedulePage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "VEHICLE_OWNER") redirect("/login");

  const vehicles = await prisma.vehicle.findMany({
    where: { ownerName: session.user.name },
    select: { id: true },
  });
  const vehicleIds = vehicles.map((v) => v.id);

  const schedules = await prisma.fuelSchedule.findMany({
    where: {
      vehicleId: { in: vehicleIds },
      isCompleted: false,
      isCancelled: false,
    },
    orderBy: { scheduledDate: "asc" },
    include: {
      vehicle: { select: { licenseNumber: true, vehicleType: true, ownerName: true, make: true, model: true, year: true } },
    },
  });

  return (
    <div className="flex flex-col h-full">
      <Topbar title="My Schedule" />
      <div className="flex-1 p-4 md:p-6 space-y-4">
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No upcoming fuel schedules. Schedules are assigned automatically after each dispense.
            </CardContent>
          </Card>
        ) : (
          schedules.map((s) => {
            const isOverdue = isPast(new Date(s.scheduledDate));
            return (
              <Card key={s.id} className={isOverdue ? "border-amber-300" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-mono">{s.vehicle.licenseNumber}</CardTitle>
                    {isOverdue && (
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {s.vehicle.year} {s.vehicle.make} {s.vehicle.model} · {VehicleTypeLabel[s.vehicle.vehicleType as VehicleType]}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Owner</p>
                      <p className="font-medium">{s.vehicle.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Date</p>
                      <p className="font-medium">{format(new Date(s.scheduledDate), "dd MMM yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Time Slot</p>
                      <p className="font-medium">{s.timeSlot}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Pump</p>
                      <p className="font-medium">{s.pumpName}</p>
                      <p className="text-xs text-muted-foreground">{s.pumpDistrict}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

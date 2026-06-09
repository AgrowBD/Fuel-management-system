"use client";
// Displays the result of an eligibility check as a colored card.
// Green = eligible, Red = restricted, Orange = not registered.
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VehicleTypeLabel } from "@/types";
import type { EligibilityResult as EligibilityResultType, VehicleType } from "@/types";

interface Props {
  result: EligibilityResultType;
  liters: string;
  onLitersChange: (v: string) => void;
  onDispense: () => void;
  dispensing: boolean;
}

function GovtBadge() {
  return <Badge className="bg-blue-600 text-white text-xs">Government</Badge>;
}

export function EligibilityResult({ result, liters, onLitersChange, onDispense, dispensing }: Props) {
  if (result.eligible === false && result.reason === "VEHICLE_NOT_REGISTERED") {
    return (
      <Card className="border-orange-300 bg-orange-50 dark:bg-orange-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-orange-700 dark:text-orange-400">Vehicle Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-700 dark:text-orange-400">
            This vehicle is not registered in the system.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (result.eligible === false && result.reason === "IN_RESTRICTION_PERIOD") {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base text-destructive">Fuel Restricted</CardTitle>
            <div className="flex gap-1.5">
              {result.isGovernment && <GovtBadge />}
              <Badge variant="destructive">Blocked</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
            <span>Owner</span><span className="text-foreground font-medium">{result.ownerName}</span>
            <span>Vehicle Type</span><span className="text-foreground font-medium">{VehicleTypeLabel[result.vehicleType as VehicleType]}</span>
            <span>License</span><span className="text-foreground font-medium">{result.licenseNumber}</span>
            {result.fuelCardNumber && (
              <><span>Fuel Card</span><span className="text-foreground font-medium">{result.fuelCardNumber}</span></>
            )}
            <span>Last Fuelled</span><span className="text-foreground font-medium">{format(new Date(result.lastTransactionAt), "dd MMM yyyy, HH:mm")}</span>
            <span>Eligible From</span><span className="text-foreground font-medium">{format(new Date(result.restrictionEndsAt), "dd MMM yyyy, HH:mm")}</span>
            <span>Can Get Now</span><span className="text-destructive font-bold">0 liters</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.eligible) {
    return (
      <Card className="border-green-400 bg-green-50 dark:bg-green-950/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base text-green-700 dark:text-green-400">Eligible for Fuel</CardTitle>
            <div className="flex gap-1.5">
              {result.isGovernment && <GovtBadge />}
              <Badge className="bg-green-600 text-white">Approved</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>Owner</span><span className="text-foreground font-medium">{result.ownerName}</span>
            <span>Vehicle Type</span><span className="text-foreground font-medium">{VehicleTypeLabel[result.vehicleType as VehicleType]}</span>
            <span>License</span><span className="text-foreground font-medium">{result.licenseNumber}</span>
            {result.fuelCardNumber && (
              <><span>Fuel Card</span><span className="text-foreground font-medium">{result.fuelCardNumber}</span></>
            )}
            <span>Can Receive Now</span><span className="text-green-700 dark:text-green-400 font-bold">{result.maxLiters} liters</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="liters">Liters to dispense</Label>
            <div className="flex gap-2">
              <Input
                id="liters"
                type="number"
                min="0.1"
                max={result.maxLiters}
                step="0.1"
                value={liters}
                onChange={(e) => onLitersChange(e.target.value)}
                className="max-w-32"
              />
              <Button onClick={onDispense} disabled={dispensing} className="bg-green-600 hover:bg-green-700 text-white">
                {dispensing ? "Recording…" : "Confirm Dispense"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

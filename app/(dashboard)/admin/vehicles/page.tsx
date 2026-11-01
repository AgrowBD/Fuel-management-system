"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VehicleTypeLabel } from "@/types";
import type { VehicleType } from "@/types";

type Owner = {
  id: string;
  fullName: string;
  isActive: boolean;
  vehicles: Array<{
    id: string;
    licenseNumber: string;
    vehicleType: string;
    make: string;
    model: string;
    year: number;
  }>;
};

const initialForm = {
  licenseNumber: "",
  vehicleType: "CAR",
  make: "",
  model: "",
  year: String(new Date().getFullYear()),
  fuelCardNumber: "",
};

export default function AdminVehiclesPage() {
  const [lookupMode, setLookupMode] = useState<"nid" | "license">("nid");
  const [nid, setNid] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [owner, setOwner] = useState<Owner | null>(null);
  const [form, setForm] = useState(initialForm);
  const [lookingUp, setLookingUp] = useState(false);
  const [saving, setSaving] = useState(false);

  async function lookupOwner(event: React.FormEvent) {
    event.preventDefault();
    setLookingUp(true);
    setOwner(null);
    try {
      const query = lookupMode === "nid"
        ? `nid=${encodeURIComponent(nid)}`
        : `licenseNumber=${encodeURIComponent(licenseNumber)}`;
      const response = await fetch(`/api/admin/owners/lookup?${query}`);
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Owner lookup failed");
        return;
      }
      setOwner(data);
    } catch {
      toast.error("Owner lookup failed");
    } finally {
      setLookingUp(false);
    }
  }

  async function addVehicle(event: React.FormEvent) {
    event.preventDefault();
    if (!owner) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerNid: nid,
          ...form,
          year: Number(form.year),
          fuelCardNumber: form.fuelCardNumber || null,
          isGovernment: false,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Vehicle could not be added");
        return;
      }
      toast.success(`${data.licenseNumber} added to ${owner.fullName}`);
      setForm(initialForm);
      await lookupOwner({ preventDefault() {} } as React.FormEvent);
    } catch {
      toast.error("Vehicle could not be added");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="flex h-full flex-col">
      <Topbar title="Vehicle Registration" />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Find an owner</CardTitle>
            <CardDescription>Enter the owner&apos;s 10-digit NID to review their registered vehicles.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={lookupOwner} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="lookup-mode">Search by</Label>
                <select
                  id="lookup-mode"
                  value={lookupMode}
                  onChange={(event) => setLookupMode(event.target.value as "nid" | "license")}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="nid">Owner NID</option>
                  <option value="license">Vehicle registration</option>
                </select>
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="owner-lookup">{lookupMode === "nid" ? "Owner NID" : "Vehicle registration"}</Label>
                <Input
                  id="owner-lookup"
                  value={lookupMode === "nid" ? nid : licenseNumber}
                  onChange={(event) => lookupMode === "nid"
                    ? setNid(event.target.value.replace(/\D/g, "").slice(0, 10))
                    : setLicenseNumber(event.target.value.toUpperCase())}
                  inputMode={lookupMode === "nid" ? "numeric" : "text"}
                  placeholder={lookupMode === "nid" ? "10 digit NID" : "DHA-GA-11-1001"}
                  maxLength={lookupMode === "nid" ? 10 : 30}
                />
              </div>
              <Button
                type="submit"
                disabled={lookingUp || (lookupMode === "nid" ? nid.length !== 10 : licenseNumber.trim().length === 0)}
              >
                {lookingUp ? "Checking..." : "Find owner"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {owner && (
          <div className="grid max-w-5xl gap-6 lg:grid-cols-[1fr_1.1fr]">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{owner.fullName}</CardTitle>
                    <CardDescription className="mt-1">Matched owner record</CardDescription>
                  </div>
                  <Badge className="bg-green-600 text-white">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">Existing vehicles ({owner.vehicles.length})</p>
                {owner.vehicles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active vehicles registered.</p>
                ) : (
                  <div className="space-y-2">
                    {owner.vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="rounded-md border px-3 py-2">
                        <p className="font-mono text-sm font-medium">{vehicle.licenseNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {vehicle.year} {vehicle.make} {vehicle.model} · {VehicleTypeLabel[vehicle.vehicleType as VehicleType] ?? vehicle.vehicleType}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add vehicle</CardTitle>
                <CardDescription>This vehicle will be linked to {owner.fullName}.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={addVehicle} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="license-number">License number</Label>
                    <Input id="license-number" value={form.licenseNumber} onChange={(event) => updateField("licenseNumber", event.target.value.toUpperCase())} placeholder="DHA-GA-11-9999" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicle-type">Vehicle type</Label>
                    <select id="vehicle-type" value={form.vehicleType} onChange={(event) => updateField("vehicleType", event.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                      {Object.entries(VehicleTypeLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicle-year">Year</Label>
                    <Input id="vehicle-year" type="number" value={form.year} onChange={(event) => updateField("year", event.target.value)} min={1950} max={new Date().getFullYear() + 1} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicle-make">Make</Label>
                    <Input id="vehicle-make" value={form.make} onChange={(event) => updateField("make", event.target.value)} placeholder="Toyota" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicle-model">Model</Label>
                    <Input id="vehicle-model" value={form.model} onChange={(event) => updateField("model", event.target.value)} placeholder="Corolla" required />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="fuel-card">Fuel card number (optional)</Label>
                    <Input id="fuel-card" value={form.fuelCardNumber} onChange={(event) => updateField("fuelCardNumber", event.target.value.toUpperCase())} placeholder="FC-CIV-9999" />
                  </div>
                  <Button type="submit" className="sm:col-span-2" disabled={saving}>
                    {saving ? "Adding vehicle..." : "Add vehicle to owner"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";
// Admin distribution rules page: view and edit quota rules per vehicle type.
// Each row is editable inline — changes are saved immediately on submit.
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleTypeLabel } from "@/types";
import type { VehicleType } from "@/types";

type Rule = {
  id: string;
  vehicleType: string;
  maxLitersPerCycle: number;
  restrictionDays: number;
  description: string | null;
  updatedAt: string;
};

function RuleRow({ rule, onSave }: { rule: Rule; onSave: (vehicleType: string, data: Partial<Rule>) => Promise<void> }) {
  const [liters, setLiters] = useState(String(rule.maxLitersPerCycle));
  const [days, setDays] = useState(String(rule.restrictionDays));
  const [saving, setSaving] = useState(false);
  const dirty = liters !== String(rule.maxLitersPerCycle) || days !== String(rule.restrictionDays);

  async function handleSave() {
    const l = parseFloat(liters);
    const d = parseInt(days);
    if (isNaN(l) || l <= 0 || isNaN(d) || d < 1) {
      toast.error("Enter valid values");
      return;
    }
    setSaving(true);
    await onSave(rule.vehicleType, { maxLitersPerCycle: l, restrictionDays: d });
    setSaving(false);
  }

  return (
    <tr className="border-b last:border-0">
      <td className="py-3 pr-4 font-medium">
        {VehicleTypeLabel[rule.vehicleType as VehicleType] ?? rule.vehicleType}
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            className="w-20 h-8 text-sm"
            min="0.1"
            step="0.5"
          />
          <span className="text-xs text-muted-foreground">L</span>
        </div>
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-20 h-8 text-sm"
            min="1"
            step="1"
          />
          <span className="text-xs text-muted-foreground">days</span>
        </div>
      </td>
      <td className="py-3 pr-4 text-xs text-muted-foreground">{rule.description ?? "—"}</td>
      <td className="py-3">
        {dirty && (
          <Button size="sm" className="h-7 text-xs" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        )}
      </td>
    </tr>
  );
}

export default function AdminRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/rules")
      .then((r) => r.json())
      .then(setRules)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(vehicleType: string, data: Partial<Rule>) {
    const res = await fetch(`/api/admin/rules/${vehicleType}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setRules((prev) => prev.map((r) => (r.vehicleType === vehicleType ? updated : r)));
      toast.success("Rule updated");
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to update rule");
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Distribution Rules" />
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Fuel Quota Rules</CardTitle>
            <p className="text-sm text-muted-foreground">
              Edit the max liters and restriction period per vehicle type. Changes take effect immediately for new transactions.
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Vehicle Type</th>
                      <th className="pb-2 pr-4 font-medium">Max Liters / Cycle</th>
                      <th className="pb-2 pr-4 font-medium">Restriction Period</th>
                      <th className="pb-2 pr-4 font-medium">Description</th>
                      <th className="pb-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <RuleRow key={rule.vehicleType} rule={rule} onSave={handleSave} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

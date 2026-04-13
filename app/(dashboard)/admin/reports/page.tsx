"use client";
// Admin reports page: date-range CSV export.
import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminReportsPage() {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);

  function handleExport() {
    const url = `/api/admin/reports/export?from=${from}&to=${to}`;
    window.open(url, "_blank");
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Reports" />
      <div className="flex-1 p-4 md:p-6">
        <Card className="max-w-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Export Transactions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Download a CSV file of all fuel transactions in the selected date range.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="from">From</Label>
                <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="to">To</Label>
                <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleExport} className="w-full">
              Download CSV
            </Button>
            <p className="text-xs text-muted-foreground">
              Exports: date, time, license number, vehicle type, owner, liters requested/dispensed, status, pump, district, operator.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

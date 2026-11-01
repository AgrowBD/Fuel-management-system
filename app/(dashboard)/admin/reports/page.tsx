"use client";

import { useCallback, useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsPayload } from "@/lib/analytics";

const COLORS = ["#166534", "#0f766e", "#ca8a04", "#1d4ed8", "#9f1239", "#57534e"];

function formatLiters(value: number) {
  return `${Math.round(value).toLocaleString()} L`;
}

export default function AdminAnalyticsPage() {
  const [mode, setMode] = useState<"demo" | "real">("demo");
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics?mode=${mode}&days=${days}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Analytics unavailable");
      setData(result);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Analytics unavailable");
    } finally {
      setLoading(false);
    }
  }, [days, mode]);

  useEffect(() => {
    setLoading(true);
    fetchAnalytics();
    const timer = window.setInterval(fetchAnalytics, 60_000);
    return () => window.clearInterval(timer);
  }, [fetchAnalytics]);

  function switchMode(nextMode: "demo" | "real") {
    setMode(nextMode);
    if (nextMode === "real") toast.info("Real transaction data selected");
  }

  return (
    <div className="flex h-full flex-col bg-[#101817] text-[#e9f1e8]">
      <Topbar title="Fuel Analytics" theme="dark" />
      <main className="flex-1 space-y-6 overflow-y-auto bg-[#101817] p-4 text-[#e9f1e8] md:p-6 [&_[data-slot=card]]:border-[#38534a] [&_[data-slot=card]]:bg-[#182521] [&_[data-slot=card]]:text-[#e9f1e8]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">BPC monitoring view</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Demand and depletion forecast</h2>
            <p className="mt-1 max-w-2xl text-sm text-[#9fb5ad]">Projected usage based on recorded dispensing trends, not a measured national reserve.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border p-1" role="group" aria-label="Analytics data mode">
              <Button type="button" size="sm" variant={mode === "demo" ? "default" : "ghost"} onClick={() => switchMode("demo")}>Demonstrate</Button>
              <Button type="button" size="sm" variant={mode === "real" ? "default" : "ghost"} onClick={() => switchMode("real")}>Real data</Button>
            </div>
            <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="h-9 rounded-md border border-[#38534a] bg-[#182521] px-3 text-sm text-[#e9f1e8]" aria-label="Analytics period">
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#9fb5ad]">
          <Badge variant="outline">{mode === "demo" ? "Demonstration data" : "Live transaction data"}</Badge>
          {data && <span>Refreshes automatically every minute · Updated {new Date(data.generatedAt).toLocaleTimeString()}</span>}
        </div>

        {error && <Card><CardContent className="py-6 text-sm text-destructive">{error}</CardContent></Card>}
        {loading && !data ? <AnalyticsSkeleton /> : data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric title="Fuel dispensed" value={formatLiters(data.summary.totalLiters)} />
              <Metric title="Average per day" value={formatLiters(data.summary.averageDailyLiters)} />
              <Metric title="Projected days remaining" value={data.summary.projectedDaysRemaining ? `${data.summary.projectedDaysRemaining} days` : "Configure forecast"} />
              <Metric title="Projected depletion" value={data.summary.projectedDepletionDate ?? "Not available"} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <Card>
                <CardHeader><CardTitle>Daily demand</CardTitle><CardDescription>Liters dispensed across the selected period</CardDescription></CardHeader>
                <CardContent><div className="chart-stage"><ResponsiveContainer width="100%" height={280}><AreaChart data={data.daily}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => [`${Number(value).toLocaleString()} L`, "Dispensed"]} /><Area type="monotone" dataKey="liters" stroke="#8ac48a" fill="#2f6f52" fillOpacity={0.55} strokeWidth={2} /></AreaChart></ResponsiveContainer></div></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Company share</CardTitle><CardDescription>Recorded demand by distribution company</CardDescription></CardHeader>
                <CardContent><div className="chart-stage"><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={data.byCompany} dataKey="liters" nameKey="company" innerRadius={62} outerRadius={94} paddingAngle={3}>{data.byCompany.map((entry, index) => <Cell key={entry.company} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value) => [`${Number(value).toLocaleString()} L`, "Dispensed"]} /></PieChart></ResponsiveContainer></div><div className="space-y-2">{data.byCompany.map((company, index) => <div key={company.company} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />{company.company}</span><span className="font-medium">{formatLiters(company.liters)}</span></div>)}</div></CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Demand by vehicle type</CardTitle><CardDescription>Useful for identifying consumption concentration</CardDescription></CardHeader>
                <CardContent><div className="chart-stage"><ResponsiveContainer width="100%" height={260}><BarChart data={data.byVehicleType} layout="vertical" margin={{ left: 18, right: 12 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="label" width={105} tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => [`${Number(value).toLocaleString()} L`, "Dispensed"]} /><Bar dataKey="liters" fill="#62b69a" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Company depletion outlook</CardTitle><CardDescription>Projection assumes no replenishment and continued current demand</CardDescription></CardHeader>
                <CardContent className="space-y-3">{data.byCompany.map((company) => <div key={company.company} className="rounded-md border p-3"><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium">{company.company}</span><span className="text-sm font-semibold">{company.daysRemaining ? `${company.daysRemaining} days` : "No demand data"}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-700" style={{ width: `${Math.min(100, company.startingLiters ? (company.liters / company.startingLiters) * 100 * 12 : 0)}%` }} /></div><p className="mt-1 text-xs text-muted-foreground">Starting amount: {formatLiters(company.startingLiters)}</p></div>)}</CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Fuel sales by division</CardTitle><CardDescription>Demonstration distribution across Bangladesh&apos;s eight divisions</CardDescription></CardHeader>
                <CardContent><div className="chart-stage"><ResponsiveContainer width="100%" height={290}><BarChart data={data.byDivision} margin={{ left: 4, right: 12 }}><CartesianGrid stroke="#294039" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="division" tick={{ fill: "#b7cbc2", fontSize: 11 }} interval={0} angle={-22} textAnchor="end" height={52} /><YAxis tick={{ fill: "#b7cbc2", fontSize: 11 }} /><Tooltip contentStyle={{ background: "#182521", border: "1px solid #38534a", color: "#e9f1e8" }} formatter={(value) => [`${Number(value).toLocaleString()} L`, "Sales"]} /><Bar dataKey="liters" fill="#8ac48a" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>{mode === "real" && <p className="text-xs text-[#9fb5ad]">Division fields are not yet present in real transaction aggregates.</p>}</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Global oil price vs demand</CardTitle><CardDescription>Dummy correlation view: higher benchmark prices paired with modeled demand</CardDescription></CardHeader>
                <CardContent><div className="chart-stage"><ResponsiveContainer width="100%" height={290}><ScatterChart margin={{ top: 12, right: 18, bottom: 12, left: 0 }}><CartesianGrid stroke="#294039" strokeDasharray="3 3" /><XAxis type="number" dataKey="price" name="Oil price" unit=" USD" tick={{ fill: "#b7cbc2", fontSize: 11 }} /><YAxis type="number" dataKey="demand" name="Demand" unit=" L/day" tick={{ fill: "#b7cbc2", fontSize: 11 }} /><Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#182521", border: "1px solid #38534a", color: "#e9f1e8" }} formatter={(value, name) => [name === "Oil price" ? `$${value}` : `${Number(value).toLocaleString()} L/day`, name]} /><Scatter name="Monthly observations" data={data.oilPriceDemand} fill="#e6b85c" /></ScatterChart></ResponsiveContainer></div>{mode === "real" && <p className="text-xs text-[#9fb5ad]">Global price correlation is available in Demonstrate mode only.</p>}</CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return <Card><CardContent className="pt-5"><p className="text-xs font-medium uppercase tracking-wide text-[#9fb5ad]">{title}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-[#f2f7ed]">{value}</p></CardContent></Card>;
}

function AnalyticsSkeleton() {
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-24" />)}</div><div className="grid gap-6 xl:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div></div>;
}

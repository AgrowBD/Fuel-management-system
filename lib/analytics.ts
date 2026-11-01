import { subDays, format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { VehicleTypeLabel } from "@/types";
import type { VehicleType } from "@/types";

export type AnalyticsPayload = {
  mode: "demo" | "real";
  generatedAt: string;
  days: number;
  summary: {
    totalLiters: number;
    averageDailyLiters: number;
    projectedDaysRemaining: number | null;
    projectedDepletionDate: string | null;
  };
  daily: Array<{ date: string; liters: number }>;
  byCompany: Array<{ company: string; liters: number; startingLiters: number; daysRemaining: number | null }>;
  byVehicleType: Array<{ type: string; label: string; liters: number }>;
  byDivision: Array<{ division: string; liters: number }>;
  oilPriceDemand: Array<{ price: number; demand: number; month: string }>;
};

const DEMO_COMPANIES = [
  { company: "Padma Oil Company", liters: 12480, startingLiters: 80000 },
  { company: "Meghna Petroleum", liters: 10320, startingLiters: 70000 },
  { company: "Jamuna Oil Company", liters: 8460, startingLiters: 55000 },
];

const DEMO_DIVISIONS = [
  ["Dhaka", 18400],
  ["Mymensingh", 5920],
  ["Sylhet", 4380],
  ["Chattogram", 12100],
  ["Barishal", 3710],
  ["Rajshahi", 7240],
  ["Rangpur", 5160],
  ["Khulna", 8290],
] as const;

const DEMO_OIL_PRICE_DEMAND = [
  [72, 710, "Jan"], [76, 755, "Feb"], [79, 790, "Mar"], [83, 824, "Apr"],
  [87, 862, "May"], [91, 905, "Jun"], [95, 931, "Jul"], [89, 886, "Aug"],
  [84, 844, "Sep"], [80, 812, "Oct"], [77, 776, "Nov"], [74, 742, "Dec"],
] as const;

const DEMO_TYPES = [
  ["CAR", 12900],
  ["TRUCK", 10150],
  ["BUS", 8720],
  ["MICROBUS", 6480],
  ["MOTORCYCLE", 2840],
  ["CNG_AUTO_RICKSHAW", 4170],
] as const;

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function buildDemoData(days: number): AnalyticsPayload {
  const daily = Array.from({ length: days }, (_, index) => {
    const date = subDays(new Date(), days - index - 1);
    const trend = 830 + index * 9;
    const variation = ((index * 17) % 61) - 30;
    return { date: format(date, "dd MMM"), liters: Math.max(0, Math.round(trend + variation)) };
  });
  const averageDailyLiters = daily.reduce((sum, item) => sum + item.liters, 0) / daily.length;
  const totalLiters = daily.reduce((sum, item) => sum + item.liters, 0);
  const startingLiters = 150000;
  const daysRemaining = Math.floor(startingLiters / averageDailyLiters);

  return {
    mode: "demo",
    generatedAt: new Date().toISOString(),
    days,
    summary: {
      totalLiters: round(totalLiters),
      averageDailyLiters: round(averageDailyLiters),
      projectedDaysRemaining: daysRemaining,
      projectedDepletionDate: format(subDays(new Date(), -daysRemaining), "yyyy-MM-dd"),
    },
    daily,
    byCompany: DEMO_COMPANIES.map((item) => ({
      ...item,
      daysRemaining: Math.floor(item.startingLiters / (item.liters / days)),
    })),
    byVehicleType: DEMO_TYPES.map(([type, liters]) => ({
      type,
      label: VehicleTypeLabel[type as VehicleType] ?? type,
      liters,
    })),
    byDivision: DEMO_DIVISIONS.map(([division, liters]) => ({ division, liters })),
    oilPriceDemand: DEMO_OIL_PRICE_DEMAND.map(([price, demand, month]) => ({ price, demand, month })),
  };
}

async function buildRealData(days: number): Promise<AnalyticsPayload> {
  const since = subDays(new Date(), days);
  const [transactions, companies] = await Promise.all([
    prisma.fuelTransaction.findMany({
      where: { transactedAt: { gte: since }, status: { in: ["APPROVED", "PARTIAL"] } },
      select: { transactedAt: true, litersDispensed: true, companyId: true, vehicle: { select: { vehicleType: true } } },
    }),
    prisma.fuelCompany.findMany({ where: { isActive: true }, select: { id: true, name: true, startingAvailableLiters: true } }),
  ]);

  const dailyMap = new Map<string, number>();
  const typeMap = new Map<string, number>();
  const companyMap = new Map<string, number>();
  for (const transaction of transactions) {
    const day = format(transaction.transactedAt, "dd MMM");
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + transaction.litersDispensed);
    typeMap.set(transaction.vehicle.vehicleType, (typeMap.get(transaction.vehicle.vehicleType) ?? 0) + transaction.litersDispensed);
    if (transaction.companyId) companyMap.set(transaction.companyId, (companyMap.get(transaction.companyId) ?? 0) + transaction.litersDispensed);
  }

  const daily = Array.from(dailyMap, ([date, liters]) => ({ date, liters: round(liters) }));
  const totalLiters = transactions.reduce((sum, transaction) => sum + transaction.litersDispensed, 0);
  const averageDailyLiters = totalLiters / Math.max(days, 1);

  return {
    mode: "real",
    generatedAt: new Date().toISOString(),
    days,
    summary: {
      totalLiters: round(totalLiters),
      averageDailyLiters: round(averageDailyLiters),
      projectedDaysRemaining: null,
      projectedDepletionDate: null,
    },
    daily,
    byCompany: companies.map((company) => {
      const liters = companyMap.get(company.id) ?? 0;
      return { company: company.name, liters: round(liters), startingLiters: company.startingAvailableLiters, daysRemaining: liters > 0 ? Math.floor(company.startingAvailableLiters / (liters / Math.max(days, 1))) : null };
    }),
    byVehicleType: Array.from(typeMap, ([type, liters]) => ({ type, label: VehicleTypeLabel[type as VehicleType] ?? type, liters: round(liters) })),
    byDivision: [],
    oilPriceDemand: [],
  };
}

export async function getAnalyticsData(mode: "demo" | "real", days: number) {
  return mode === "demo" ? buildDemoData(days) : buildRealData(days);
}

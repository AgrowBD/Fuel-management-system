import { addDays, subDays } from "date-fns";

export const BANGLADESH_TIME_ZONE = "Asia/Dhaka";

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getParts(value: Date): DateParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BANGLADESH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);

  const values = Object.fromEntries(parts.map((part) => [part.type, Number(part.value)]));
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

export function formatBangladeshDate(value: Date | string, pattern: string): string {
  const date = new Date(value);
  const parts = getParts(date);
  const month = new Intl.DateTimeFormat("en-US", {
    timeZone: BANGLADESH_TIME_ZONE,
    month: "short",
  }).format(date);
  const pad = (number: number) => String(number).padStart(2, "0");

  return pattern
    .replace("yyyy", String(parts.year))
    .replace("MMM", month)
    .replace("MM", pad(parts.month))
    .replace("dd", pad(parts.day))
    .replace("HH", pad(parts.hour))
    .replace("mm", pad(parts.minute));
}

export function startOfBangladeshDay(value = new Date()): Date {
  const parts = getParts(value);
  return bangladeshDateAt(parts.year, parts.month, parts.day);
}

export function startOfBangladeshWeek(value = new Date(), weekStartsOn = 6): Date {
  const dayStart = startOfBangladeshDay(value);
  const day = new Date(dayStart).getUTCDay();
  const daysSinceStart = (day - weekStartsOn + 7) % 7;
  return subDays(dayStart, daysSinceStart);
}

export function bangladeshDateAt(year: number, month: number, day: number, hour = 0): Date {
  // Bangladesh is UTC+06:00 year-round, so this UTC value represents local Dhaka time.
  return new Date(Date.UTC(year, month - 1, day, hour - 6));
}

export function parseBangladeshDate(value: string, endOfDay = false): Date {
  const [year, month, day] = value.split("-").map(Number);
  const date = bangladeshDateAt(year, month, day);
  return endOfDay ? addDays(date, 1) : date;
}

export function addBangladeshDays(value: Date, days: number): Date {
  const parts = getParts(value);
  const localMidnight = bangladeshDateAt(parts.year, parts.month, parts.day);
  return addDays(localMidnight, days);
}

export function isBeforeNow(value: Date): boolean {
  return value.getTime() < Date.now();
}

export function differenceInBangladeshCalendarDays(later: Date, earlier: Date): number {
  const laterParts = getParts(later);
  const earlierParts = getParts(earlier);
  const laterDate = Date.UTC(laterParts.year, laterParts.month - 1, laterParts.day);
  const earlierDate = Date.UTC(earlierParts.year, earlierParts.month - 1, earlierParts.day);
  return Math.round((laterDate - earlierDate) / 86_400_000);
}

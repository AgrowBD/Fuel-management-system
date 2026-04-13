// Reusable stat display card used across all dashboards.
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "default" | "green" | "red" | "amber";
}

export function StatCard({ label, value, sub, accent = "default" }: StatCardProps) {
  const valueColor = {
    default: "text-foreground",
    green: "text-green-600 dark:text-green-400",
    red: "text-destructive",
    amber: "text-amber-600 dark:text-amber-400",
  }[accent];

  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className={cn("text-2xl font-bold mt-1", valueColor)}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

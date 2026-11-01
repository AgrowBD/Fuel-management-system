"use client";
// Role-aware sidebar navigation.
// On mobile it renders inside a drawer — receives onClose to dismiss it.
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CarFront,
  ClipboardList,
  Fuel,
  Gauge,
  ListChecks,
  Printer,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

type NavItem = { label: string; href: string; icon: typeof Fuel };

const NAV_ITEMS: Record<Role, NavItem[]> = {
  VEHICLE_OWNER: [
    { label: "Status", href: "/owner/status", icon: Gauge },
    { label: "Fuel History", href: "/owner/history", icon: ClipboardList },
    { label: "My Schedule", href: "/owner/schedule", icon: ListChecks },
  ],
  OPERATOR: [
    { label: "Dispense Fuel", href: "/operator", icon: Fuel },
    { label: "Today's Activity", href: "/operator/history", icon: ClipboardList },
  ],
  ADMIN: [
    { label: "Overview", href: "/admin", icon: Gauge },
    { label: "Transactions", href: "/admin/transactions", icon: ClipboardList },
    { label: "Vehicles", href: "/admin/vehicles", icon: CarFront },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Distribution Rules", href: "/admin/rules", icon: ListChecks },
    { label: "Govt Quota Rules", href: "/admin/govt-rules", icon: ShieldCheck },
    { label: "Print Fuel Card", href: "/admin/fuel-card-print", icon: Printer },
    { label: "Analytics", href: "/admin/reports", icon: BarChart3 },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  VEHICLE_OWNER: "Vehicle Owner",
  OPERATOR: "Pump Operator",
  ADMIN: "Administrator",
};

interface SidebarProps {
  role: Role;
  userName: string;
  onClose?: () => void; // only provided when rendered as mobile drawer
}

export function Sidebar({ role, userName, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] ?? [];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[8px_0_24px_rgba(20,50,35,0.08)]">
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-sidebar-primary p-2 text-sidebar-primary-foreground shadow-sm">
            <Fuel className="size-5" />
          </div>
          <div>
            <p className="text-[1.05rem] font-bold tracking-tight text-sidebar-foreground">Fuel Distribution</p>
            <p className="mt-1 text-[0.8rem] text-sidebar-foreground/65">Bangladesh Petroleum Corp.</p>
          </div>
        </div>
        {/* Close button — only shown on mobile drawer */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 rounded p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose} // close drawer on navigation (mobile)
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3.5 py-3 text-[0.95rem] font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
            <item.icon className="size-4 opacity-75 transition-transform duration-200 group-hover:scale-110" />
            {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-sidebar-border px-4 py-4">
        <p className="truncate text-sm font-medium text-sidebar-foreground">{userName}</p>
        <p className="text-[0.8rem] text-sidebar-foreground/60">{ROLE_LABEL[role]}</p>
      </div>
    </aside>
  );
}

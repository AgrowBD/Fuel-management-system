"use client";
// Role-aware sidebar navigation.
// On mobile it renders inside a drawer — receives onClose to dismiss it.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

type NavItem = { label: string; href: string };

const NAV_ITEMS: Record<Role, NavItem[]> = {
  VEHICLE_OWNER: [
    { label: "Overview", href: "/owner" },
    { label: "Fuel History", href: "/owner/history" },
    { label: "My Schedule", href: "/owner/schedule" },
  ],
  OPERATOR: [
    { label: "Dispense Fuel", href: "/operator" },
    { label: "Today's Activity", href: "/operator/history" },
  ],
  ADMIN: [
    { label: "Overview", href: "/admin" },
    { label: "Transactions", href: "/admin/transactions" },
    { label: "Users", href: "/admin/users" },
    { label: "Distribution Rules", href: "/admin/rules" },
    { label: "Reports", href: "/admin/reports" },
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
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Brand */}
      <div className="flex items-center justify-between px-6 py-6 border-b">
        <div>
          <p className="text-base font-bold tracking-tight text-foreground">Fuel Distribution</p>
          <p className="text-xs text-muted-foreground mt-1">Bangladesh Petroleum Corp.</p>
        </div>
        {/* Close button — only shown on mobile drawer */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 rounded p-1 text-muted-foreground hover:text-foreground"
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
                "flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t">
        <p className="text-xs font-medium text-foreground truncate">{userName}</p>
        <p className="text-xs text-muted-foreground">{ROLE_LABEL[role]}</p>
      </div>
    </aside>
  );
}

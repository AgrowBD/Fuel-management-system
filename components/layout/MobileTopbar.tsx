"use client";
// Mobile-only top bar with hamburger button. Hidden on md+ screens.
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onMenuClick: () => void;
}

export function MobileTopbar({ onMenuClick }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground md:hidden">
      <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2">
        <Menu className="h-5 w-5" />
      </Button>
      <span className="ml-3 text-sm font-bold tracking-tight">Fuel Distribution</span>
    </header>
  );
}

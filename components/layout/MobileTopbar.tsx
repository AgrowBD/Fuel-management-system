"use client";
// Mobile-only top bar with hamburger button. Hidden on md+ screens.
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onMenuClick: () => void;
}

export function MobileTopbar({ onMenuClick }: Props) {
  return (
    <header className="flex md:hidden h-14 items-center border-b bg-card px-4 shrink-0">
      <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2">
        <Menu className="h-5 w-5" />
      </Button>
      <span className="ml-3 text-sm font-bold">Fuel Distribution</span>
    </header>
  );
}

"use client";
// Page-level top bar. Visible on all screen sizes.
// On mobile, shown below the MobileTopbar (which has the hamburger).
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  title: string;
  theme?: "light" | "dark";
}

export function Topbar({ title, theme = "light" }: TopbarProps) {
  return (
    <header className={`flex h-14 shrink-0 items-center justify-between border-b px-4 backdrop-blur md:h-16 md:px-6 ${theme === "dark" ? "border-[#38534a] bg-[#101817]/95 text-[#e9f1e8]" : "border-border/80 bg-card/90"}`}>
      <h1 className={`text-base font-semibold tracking-tight md:text-lg ${theme === "dark" ? "text-[#f2f7ed]" : "text-foreground"}`}>{title}</h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="gap-2 text-muted-foreground text-sm"
      >
        <LogOut className="size-4" />
        Sign out
      </Button>
    </header>
  );
}

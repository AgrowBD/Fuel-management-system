"use client";
// Page-level top bar. Visible on all screen sizes.
// On mobile, shown below the MobileTopbar (which has the hamburger).
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="flex h-14 md:h-16 items-center justify-between border-b bg-card px-4 md:px-6 shrink-0">
      <h1 className="text-base md:text-lg font-semibold text-foreground">{title}</h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-muted-foreground text-sm"
      >
        Sign out
      </Button>
    </header>
  );
}

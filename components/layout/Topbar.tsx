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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-card/90 px-4 backdrop-blur md:h-16 md:px-6">
      <h1 className="text-base font-semibold tracking-tight text-foreground md:text-lg">{title}</h1>
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

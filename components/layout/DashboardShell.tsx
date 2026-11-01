"use client";
// Client shell that manages mobile sidebar open/close state.
// On desktop the sidebar is always visible. On mobile it slides in as a drawer.
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTopbar } from "@/components/layout/MobileTopbar";
import type { Role } from "@/types";

interface Props {
  role: Role;
  userName: string;
  children: React.ReactNode;
}

export function DashboardShell({ role, userName, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="editorial-canvas flex h-screen overflow-hidden">
      {/* ── Desktop sidebar (always visible) ── */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar role={role} userName={userName} />
      </div>

      {/* ── Mobile sidebar drawer ── */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer panel */}
          <div className="fixed inset-y-0 left-0 z-40 md:hidden">
            <Sidebar
              role={role}
              userName={userName}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile topbar with hamburger — hidden on desktop */}
        <MobileTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="page-enter flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

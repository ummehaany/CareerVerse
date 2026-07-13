"use client";

import { useState, type ReactNode } from "react";
import type { SessionUser } from "@/types/session";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils";

/**
 * The authenticated application shell: a fixed sidebar (desktop), a slide-in
 * drawer (mobile), and a sticky topbar. Rendered once by the (app) layout so it
 * persists across in-group navigation — only the page slot re-renders.
 */
export function AppShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        className="hidden lg:flex"
      />
      <MobileNav user={user} open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[4.5rem]" : "lg:pl-64")}>
        <Topbar user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

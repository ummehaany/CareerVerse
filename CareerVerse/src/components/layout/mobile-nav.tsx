"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { SessionUser } from "@/types/session";
import { navForRole } from "@/config/nav";
import { NavItem } from "./nav-item";
import { Avatar } from "@/components/ui/avatar";
import { XIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

export function MobileNav({
  user,
  open,
  onClose,
}: {
  user: SessionUser;
  open: boolean;
  onClose: () => void;
}) {
  const groups = navForRole(user.role);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={cn("fixed inset-0 z-40 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col border-r border-border bg-background transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link
            href={ROUTES.dashboard}
            onClick={onClose}
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              C
            </span>
            CareerVerse
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-foreground/5"
            aria-label="Close navigation"
          >
            <XIcon />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.key} className="space-y-1">
              {group.label && (
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-subtle">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <NavItem key={item.key} item={item} onNavigate={onClose} />
              ))}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3 border-t border-border p-4">
          <Avatar name={user.displayName} email={user.email} src={user.photoURL} size={36} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.displayName ?? user.email}</p>
            <p className="truncate text-xs capitalize text-subtle">{user.plan} plan</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

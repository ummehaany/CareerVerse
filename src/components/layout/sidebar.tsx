"use client";

import Link from "next/link";
import type { SessionUser } from "@/types/session";
import { navForRole } from "@/config/nav";
import { NavItem } from "./nav-item";
import { Avatar } from "@/components/ui/avatar";
import { ChevronRightIcon } from "@/components/ui/icon";
import { Logo, BrandMark } from "@/components/ui/logo";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

export function Sidebar({
  user,
  collapsed,
  onToggleCollapse,
  className,
}: {
  user: SessionUser;
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}) {
  const groups = navForRole(user.role);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-background transition-[width] duration-200",
        collapsed ? "w-[4.5rem]" : "w-64",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-2 border-b border-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <Link
          href={ROUTES.dashboard}
          aria-label="CareerVerse AI — go to dashboard"
          className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {collapsed ? (
            <BrandMark size={36} priority />
          ) : (
            <Logo size={32} priority textClassName="text-[15px]" />
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.key} className="space-y-1">
            {group.label && !collapsed && (
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-subtle">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <NavItem key={item.key} item={item} collapsed={collapsed} />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        {collapsed ? (
          <div className="flex justify-center">
            <Avatar name={user.displayName} email={user.email} src={user.photoURL} size={34} />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
            <Avatar name={user.displayName} email={user.email} src={user.photoURL} size={34} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.displayName ?? user.email}</p>
              <p className="truncate text-xs capitalize text-subtle">{user.plan} plan</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="mt-2 flex w-full items-center justify-center rounded-lg py-1.5 text-subtle transition-colors hover:bg-foreground/5 hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRightIcon size={18} className={cn("transition-transform", !collapsed && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
}

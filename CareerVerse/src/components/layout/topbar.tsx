"use client";

import type { SessionUser } from "@/types/session";
import Link from "next/link";
import { MenuIcon, SparklesIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import { UserMenu } from "./user-menu";
import { GlobalSearch } from "@/features/search/components/global-search";
import { Notifications } from "@/features/notifications/components/notifications";

export function Topbar({ user, onMenuClick }: { user: SessionUser; onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="-ml-1 rounded-lg p-2 text-muted transition-colors hover:bg-foreground/5 lg:hidden"
        aria-label="Open navigation"
      >
        <MenuIcon />
      </button>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {user.plan === "pro" ? (
          <span className="hidden items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/25 sm:inline-flex">
            <SparklesIcon size={12} /> PRO
          </span>
        ) : (
          <Link
            href={ROUTES.pricing}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <SparklesIcon size={13} /> <span className="hidden sm:inline">Upgrade</span>
          </Link>
        )}
        <Notifications />
        <UserMenu user={user} />
      </div>
    </header>
  );
}

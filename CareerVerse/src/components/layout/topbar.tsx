"use client";

import type { SessionUser } from "@/types/session";
import { MenuIcon, SearchIcon, BellIcon } from "@/components/ui/icon";
import { UserMenu } from "./user-menu";

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

      {/* Search / command-palette placeholder — wired up in a later phase. */}
      <div className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-subtle sm:flex">
        <SearchIcon size={18} />
        <span>Search CareerVerse…</span>
        <kbd className="ml-auto rounded border border-border px-1.5 font-sans text-xs">⌘K</kbd>
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          className="relative rounded-lg p-2 text-muted transition-colors hover:bg-foreground/5"
          aria-label="Notifications"
        >
          <BellIcon />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
        <UserMenu user={user} />
      </div>
    </header>
  );
}

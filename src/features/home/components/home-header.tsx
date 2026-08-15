"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SessionUser } from "@/types/session";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { MenuIcon, XIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import { NAV_LINKS } from "../config";

/**
 * Public homepage header. Logged-out visitors get marketing navigation +
 * sign-in/sign-up; logged-in visitors get a slimmed header that reuses the
 * real `UserMenu` (same component the authenticated app shell uses) instead
 * of inventing a second account-menu implementation.
 */
export function HomeHeader({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href={ROUTES.home}
          aria-label="CareerVerse AI home"
          className="flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Logo size={30} priority textClassName="text-[15px]" />
        </Link>

        <nav aria-label="Primary" className="hidden flex-1 items-center gap-1 lg:flex">
          {user ? (
            <>
              <Link
                href={ROUTES.dashboard}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href={ROUTES.careers}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                Explore Careers
              </Link>
              <Link
                href={ROUTES.assessment}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                Career Discovery
              </Link>
            </>
          ) : (
            NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {link.label}
              </a>
            ))
          )}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link href={ROUTES.dashboard}>
                <Button size="sm" variant="outline">
                  Go to Dashboard
                </Button>
              </Link>
              <UserMenu user={user} />
            </>
          ) : (
            <>
              <Link href={ROUTES.login}>
                <Button size="sm" variant="ghost">
                  Sign In
                </Button>
              </Link>
              <Link href={ROUTES.signup}>
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="home-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="ml-auto grid h-10 w-10 place-items-center rounded-lg text-muted transition-colors hover:bg-foreground/5 lg:hidden"
        >
          {open ? <XIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      {open && (
        <div id="home-mobile-nav" className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <nav aria-label="Primary" className="flex flex-col gap-1">
            {user ? (
              <>
                <Link
                  href={ROUTES.dashboard}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-foreground/5 hover:text-foreground"
                >
                  Dashboard
                </Link>
                <Link
                  href={ROUTES.careers}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-foreground/5 hover:text-foreground"
                >
                  Explore Careers
                </Link>
                <Link
                  href={ROUTES.assessment}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-foreground/5 hover:text-foreground"
                >
                  Career Discovery
                </Link>
                <Link
                  href={ROUTES.profile}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-foreground/5 hover:text-foreground"
                >
                  Profile
                </Link>
              </>
            ) : (
              NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-foreground/5 hover:text-foreground"
                >
                  {link.label}
                </a>
              ))
            )}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            {user ? (
              <Link href={ROUTES.dashboard} onClick={() => setOpen(false)}>
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href={ROUTES.login} onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href={ROUTES.signup} onClick={() => setOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

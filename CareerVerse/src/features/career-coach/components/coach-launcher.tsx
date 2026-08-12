"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SparklesIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";

/**
 * Global floating entry point to the Career Planning Engine. Hidden on the coach
 * page itself. No chat — a single tap opens the planner.
 */
export function CoachLauncher() {
  const pathname = usePathname();
  if (pathname?.startsWith(ROUTES.coach)) return null;

  return (
    <Link
      href={ROUTES.coach}
      aria-label="Open the Career Planning Engine"
      className="group fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:opacity-95"
    >
      <SparklesIcon size={18} />
      <span className="hidden sm:inline">Plan my career</span>
    </Link>
  );
}

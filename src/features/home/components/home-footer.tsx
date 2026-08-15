import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ROUTES } from "@/config/routes";
import { FOOTER_COLUMNS } from "../config";

export function HomeFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link href={ROUTES.home} className="inline-flex items-center rounded-lg" aria-label="CareerVerse AI home">
              <Logo size={28} textClassName="text-[15px]" />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">
              AI-powered career development — discover your path, build the skills, and grow with a
              personal AI mentor.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{col.title}</p>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} CareerVerse AI. All rights reserved.</p>
          <p>Built for students and professionals navigating what&apos;s next.</p>
        </div>
      </div>
    </footer>
  );
}

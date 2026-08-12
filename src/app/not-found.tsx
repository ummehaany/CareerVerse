import Link from "next/link";
import { ROUTES } from "@/config/routes";

export const metadata = { title: "Page not found" };

/** Branded 404. Rendered inside the root layout (theme + fonts available). */
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4 text-center">
      <div className="max-w-md">
        <p className="text-6xl font-bold tracking-tight text-primary">404</p>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Page not found</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={ROUTES.dashboard}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go to dashboard
          </Link>
          <Link
            href={ROUTES.home}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-5 text-sm font-medium transition-colors hover:bg-foreground/5"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}

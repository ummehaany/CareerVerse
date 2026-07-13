import Link from "next/link";
import { CompassIcon, ArrowRightIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";

export function WelcomeBanner({
  name,
  onboardingComplete,
}: {
  name: string;
  onboardingComplete: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
      <p className="text-sm font-medium text-primary">Dashboard</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
        Welcome back, {name}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Your career journey lives here — discover roles, plan your learning, prepare for interviews,
        and get mentorship, all in one place.
      </p>
      {!onboardingComplete && (
        <Link
          href={ROUTES.assessment}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <CompassIcon size={18} />
          Complete your career assessment
          <ArrowRightIcon size={16} />
        </Link>
      )}
    </section>
  );
}

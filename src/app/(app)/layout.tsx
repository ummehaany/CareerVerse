import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/auth";
import { ROUTES } from "@/config/routes";
import { AppShell } from "@/components/layout/app-shell";
import { CoachLauncher } from "@/features/career-coach/components/coach-launcher";
import { OnboardingTour } from "@/features/onboarding/components/onboarding-tour";
import { UpgradeDialog } from "@/features/subscription/components/upgrade-dialog";
import type { SessionUser } from "@/types/session";

// Authoritative auth gate for the application. Verifies the session server-side,
// loads the current user once, and renders the shell (sidebar + topbar) around
// every authenticated page.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);

  // First-run gate: only brand-new accounts (onboarding present & not completed)
  // are sent through onboarding. Grandfathered users (no onboarding field) and
  // users who finished it pass straight through — nothing else changes.
  if (user.onboarding && user.onboarding.completed === false) {
    redirect(ROUTES.onboarding);
  }

  const sessionUser: SessionUser = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    role: user.role,
    plan: user.plan,
  };

  const hasCompletedTour = Boolean(user.tourCompletedAt);

  return (
    <>
      <AppShell user={sessionUser}>{children}</AppShell>
      <CoachLauncher />
      <OnboardingTour startOpen={!hasCompletedTour} />
      <UpgradeDialog />
    </>
  );
}

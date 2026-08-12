import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/auth";
import { ROUTES } from "@/config/routes";
import { OnboardingFlow } from "@/features/onboarding/components/onboarding-flow";

export const metadata: Metadata = { title: "Welcome to CareerVerse" };

/**
 * First-run onboarding route. Lives OUTSIDE the (app) group so it renders
 * full-screen without the dashboard shell. Brand-new accounts are routed here
 * by the app layout gate; users who have already finished onboarding are sent
 * straight to the dashboard (returning users never see this).
 */
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);
  if (user.onboarding?.completed === true) redirect(ROUTES.dashboard);

  return (
    <OnboardingFlow
      initial={{
        careerGoal: user.onboarding?.careerGoal ?? null,
        careerField: user.onboarding?.careerField ?? null,
        currentLevel: user.onboarding?.currentLevel ?? null,
        targetCompanies: user.onboarding?.targetCompanies ?? [],
      }}
    />
  );
}

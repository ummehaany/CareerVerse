import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/firebase/auth";
import { siteConfig } from "@/config/site";
import type { SessionUser } from "@/types/session";
import { Alert } from "@/components/ui/alert";
import { CosmicBackground } from "@/components/layout/cosmic-background";
import { HomeHeader } from "@/features/home/components/home-header";
import { HeroSection } from "@/features/home/components/hero-section";
import { FeaturesSection } from "@/features/home/components/features-section";
import { HowItWorksSection } from "@/features/home/components/how-it-works-section";
import { DiscoveryShowcaseSection } from "@/features/home/components/discovery-showcase-section";
import { WhySection } from "@/features/home/components/why-section";
import { FinalCtaSection } from "@/features/home/components/final-cta-section";
import { HomeFooter } from "@/features/home/components/home-footer";
import { getHomeCtas } from "@/features/home/config";

export const metadata: Metadata = {
  description: siteConfig.description,
};

export default async function Home({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { deleted } = await searchParams;
  const user = await getCurrentUser();

  const sessionUser: SessionUser | null = user
    ? {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
        plan: user.plan,
      }
    : null;

  const ctas = getHomeCtas(user ? { onboardingComplete: user.onboardingComplete } : null);
  const firstName = user?.onboardingComplete
    ? (user.displayName?.split(" ")[0] ?? user.email?.split("@")[0] ?? null)
    : null;

  return (
    <div className="relative min-h-screen">
      <CosmicBackground />
      <div className="relative z-10">
        <HomeHeader user={sessionUser} />

        <main>
          {deleted === "1" && (
            <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6 lg:px-8">
              <Alert variant="info">
                Your CareerVerse account has been permanently deleted. We wish you the very best for
                your future. 👋
              </Alert>
            </div>
          )}

          <HeroSection ctas={ctas} firstName={firstName} />
          <FeaturesSection />
          <HowItWorksSection />
          <DiscoveryShowcaseSection cta={ctas.heroPrimary} />
          <WhySection />
          <FinalCtaSection cta={ctas.finalPrimary} />
        </main>

        <HomeFooter />
      </div>
    </div>
  );
}

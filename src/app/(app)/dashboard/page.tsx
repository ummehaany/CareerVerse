import type { Metadata } from "next";
import { getDashboardData } from "@/features/dashboard/queries";
import { getCoachWidgetData } from "@/features/career-coach/queries";
import { getAnalyticsWidgetData } from "@/features/analytics/queries";
import { getIntelligence } from "@/features/intelligence/queries";
import { getSubscriptionSnapshot } from "@/lib/firebase/firestore/subscription";
import { PlanUsageCard } from "@/features/subscription/components/plan-usage-card";
import { IntelHero } from "@/features/intelligence/components/intel-hero";
import { NextActions } from "@/features/intelligence/components/next-actions";
import { CoachWidget } from "@/features/career-coach/components/coach-widget";
import { AnalyticsWidget } from "@/features/analytics/components/analytics-widget";
import type { SessionUser } from "@/types/session";
import { WelcomeBanner } from "@/features/dashboard/components/welcome-banner";
import { OnboardingChecklistCard } from "@/features/onboarding/components/onboarding-checklist-card";
import { ProfileSnapshot } from "@/features/dashboard/components/profile-snapshot";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { FeatureCard } from "@/features/dashboard/components/feature-card";
import {
  FEATURE_SECTIONS,
  EARLY_FEATURE_SECTIONS,
  EARLY_QUICK_ACTIONS,
  type OverviewStat,
} from "@/features/dashboard/config";
import { TargetIcon, TrendingUpIcon, MicIcon, SparklesIcon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const d = await getDashboardData();
  const coach = await getCoachWidgetData();
  const analytics = await getAnalyticsWidgetData();
  const intel = await getIntelligence();
  const subscription = d.user ? await getSubscriptionSnapshot(d.user.uid) : null;

  const firstName =
    d.user?.displayName?.split(" ")[0] ?? d.user?.email?.split("@")[0] ?? "there";

  const sessionUser: SessionUser = d.user ?? {
    uid: "",
    displayName: null,
    email: null,
    photoURL: null,
    role: "student",
    plan: "free",
  };

  const stats: OverviewStat[] = [
    {
      key: "profile",
      label: "Profile completeness",
      value: `${d.completeness}%`,
      hint: d.onboardingComplete ? "Profile is ready" : "Finish your assessment",
      progress: d.completeness,
      icon: TargetIcon,
      accentVar: "--accent-assessment",
    },
    {
      key: "roadmap",
      label: "Roadmap progress",
      value: d.roadmap ? `${d.roadmap.percent}%` : "—",
      hint: d.roadmap ? d.roadmap.careerTitle : "No active roadmap yet",
      progress: d.roadmap ? d.roadmap.percent : 0,
      icon: TrendingUpIcon,
      accentVar: "--accent-roadmap",
    },
    {
      key: "interviews",
      label: "Interviews practiced",
      value: String(d.interviews.count),
      hint: d.interviews.bestScore !== null ? `Best score ${d.interviews.bestScore}/100` : "No sessions yet",
      progress: null,
      icon: MicIcon,
      accentVar: "--accent-interview",
    },
    {
      key: "matches",
      label: "Career matches",
      value: String(d.recommendationsCount),
      hint: d.recommendationsCount > 0 ? "Top matches ready" : "Not generated yet",
      progress: null,
      icon: SparklesIcon,
      accentVar: "--accent-mentor",
    },
  ];

  function statusFor(key: string): string {
    switch (key) {
      case "assessment":
        return d.onboardingComplete ? "Completed" : "Not started";
      case "recommendations":
        return d.recommendationsCount > 0 ? "Ready" : "Not started";
      case "roadmap":
        return d.roadmap ? `${d.roadmap.percent}% complete` : "Not started";
      case "learning":
        return d.bookmarksCount > 0 ? `${d.bookmarksCount} saved` : "Explore";
      case "resume":
        return d.resumeExists ? "Draft saved" : "Not started";
      case "interviews":
        return d.interviews.count > 0 ? `${d.interviews.count} practiced` : "Not started";
      case "companies":
        return intel.target ? `${intel.target.name} · ${intel.target.readiness}% ready` : "Not started";
      case "timeline":
        return d.roadmap ? d.roadmap.careerTitle : "Not started";
      case "skillgap":
        return "Explore";
      case "achievements":
        return "Explore";
      default:
        return "";
    }
  }

  // Progressive disclosure: before Career Discovery is complete, the
  // dashboard emphasizes the assessment CTA and only the handful of
  // early-stage actions that don't require a career direction yet. Every
  // feature stays reachable via the sidebar regardless — this only changes
  // what the dashboard itself proactively surfaces. Once Career Discovery is
  // complete, the full dashboard (unchanged from before this fix) returns.
  const isEarlyStage = !d.onboardingComplete;
  const quickActionItems = isEarlyStage ? EARLY_QUICK_ACTIONS : undefined;
  const featureSections = isEarlyStage ? EARLY_FEATURE_SECTIONS : FEATURE_SECTIONS;

  return (
    <div className="space-y-8 animate-fade-up">
      <WelcomeBanner name={firstName} onboardingComplete={d.onboardingComplete} isFirstSession={d.isFirstSession} />

      {d.onboardingChecklist && (
        <OnboardingChecklistCard
          items={d.onboardingChecklist}
          careerDiscoveryComplete={d.onboardingComplete}
          matchesExist={d.recommendationsCount > 0}
        />
      )}

      <IntelHero data={intel} />

      {intel.recommendations.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recommended for you</h2>
            <p className="hidden text-sm text-muted sm:block">Your next best steps across CareerVerse</p>
          </div>
          <NextActions actions={intel.recommendations} />
        </section>
      )}

      {/* Secondary tier: where to go next. Quick Actions and Explore both
          answer "what tools/features are available" — grouped together and
          placed right after the primary next-step guidance above, ahead of
          the supporting/reference widgets below. */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Quick actions</h2>
          <p className="hidden text-sm text-muted sm:block">Jump straight to what you need</p>
        </div>
        <QuickActions actions={quickActionItems} />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Explore CareerVerse</h2>
          <p className="hidden text-sm text-muted sm:block">
            {isEarlyStage ? "Start here — more appears as you progress" : "Everything in your career journey"}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {featureSections.map((feature) => (
            <FeatureCard key={feature.key} feature={feature} status={statusFor(feature.key)} />
          ))}
        </div>
      </section>

      {/* Supporting tier: status, coaching, and account info. Real and fully
          available, but set apart (divider + smaller heading treatment) so it
          reads as reference material rather than competing with the next-step
          CTA and secondary navigation above. */}
      <div className="space-y-4 border-t border-border pt-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Progress &amp; tools</p>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">Your progress</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {stats.map((stat) => (
                  <StatCard key={stat.key} stat={stat} muted={isEarlyStage && stat.key !== "profile"} />
                ))}
              </div>
            </section>
          </div>

          {subscription && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">Plan &amp; usage</h2>
              <PlanUsageCard snapshot={subscription} />
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">Profile</h2>
            <ProfileSnapshot
              user={sessionUser}
              completeness={d.completeness}
              onboardingComplete={d.onboardingComplete}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">AI Coach</h2>
            <CoachWidget data={coach} />
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">Analytics</h2>
            <AnalyticsWidget data={analytics} />
          </section>
        </div>
      </div>
    </div>
  );
}

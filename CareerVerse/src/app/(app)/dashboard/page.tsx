import type { Metadata } from "next";
import { getDashboardData } from "@/features/dashboard/queries";
import type { SessionUser } from "@/types/session";
import { WelcomeBanner } from "@/features/dashboard/components/welcome-banner";
import { ProfileSnapshot } from "@/features/dashboard/components/profile-snapshot";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { FeatureCard } from "@/features/dashboard/components/feature-card";
import { FEATURE_SECTIONS, type OverviewStat } from "@/features/dashboard/config";
import { TargetIcon, TrendingUpIcon, MicIcon, SparklesIcon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const d = await getDashboardData();

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
      default:
        return "";
    }
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <WelcomeBanner name={firstName} onboardingComplete={d.onboardingComplete} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">Quick actions</h2>
            <QuickActions />
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">Your progress</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((stat) => (
                <StatCard key={stat.key} stat={stat} />
              ))}
            </div>
          </section>
        </div>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">Profile</h2>
          <ProfileSnapshot
            user={sessionUser}
            completeness={d.completeness}
            onboardingComplete={d.onboardingComplete}
          />
        </section>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Explore CareerVerse</h2>
          <p className="hidden text-sm text-muted sm:block">Everything in your career journey</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURE_SECTIONS.map((feature) => (
            <FeatureCard key={feature.key} feature={feature} status={statusFor(feature.key)} />
          ))}
        </div>
      </section>
    </div>
  );
}

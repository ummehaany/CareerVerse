import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowRightIcon, CompassIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import { getProfilePageData } from "@/features/profile/queries";
import { ProfileView } from "@/features/profile/components/profile-view";
import { getMemoryDashboardData } from "@/features/memory/queries";
import { MemoryDashboard } from "@/features/memory/components/memory-dashboard";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const [data, memory] = await Promise.all([getProfilePageData(), getMemoryDashboardData()]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-up">
      <PageHeader
        title="Career Profile"
        description="Your complete CareerVerse profile — the identity that powers your matches, roadmaps, and mentorship."
      />

      {!data.hasAssessment && (
        <Link
          href={ROUTES.assessment}
          className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4 transition-colors hover:bg-primary/10"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <CompassIcon size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Complete your career assessment</span>
            <span className="block text-xs text-muted">Unlock personalized matches, roadmaps, and a richer profile.</span>
          </span>
          <ArrowRightIcon size={16} className="shrink-0 text-primary" />
        </Link>
      )}

      <ProfileView data={data} />

      <MemoryDashboard data={memory} />
    </div>
  );
}

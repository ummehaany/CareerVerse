import { getCurrentUser } from "@/lib/firebase/auth";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { listConversations } from "@/lib/firebase/firestore/coachConversations";
import { getPortfolioPageData } from "@/features/portfolio/queries";
import { getAnalyticsData } from "@/features/analytics/queries";
import { deriveUsername, publicProfilePath, publicProfileUrl } from "@/lib/profile/identity";
import type { StructuredProfile } from "@/types/assessment";
import type { FirestoreTimestamp } from "@/types/user";
import type { ProfilePageData } from "./types";

function fmtDate(ts: FirestoreTimestamp | null | undefined): string {
  if (!ts) return "—";
  try {
    return ts.toDate().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "—";
  }
}

/** Friendly "last active" — "Today", "Yesterday", or a date. */
function fmtLastActive(ts: FirestoreTimestamp | null | undefined): string {
  if (!ts) return "—";
  try {
    const d = ts.toDate();
    const now = new Date();
    const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function firstFilled(...vals: (string | undefined | null)[]): string {
  for (const v of vals) {
    const t = (v ?? "").trim();
    if (t) return t;
  }
  return "";
}

export async function getProfilePageData(): Promise<ProfilePageData> {
  const user = await getCurrentUser();

  const [portfolioData, analytics, assessment, conversations] = await Promise.all([
    getPortfolioPageData().catch(() => null),
    getAnalyticsData().catch(() => null),
    user ? getLatestAssessment(user.uid).catch(() => null) : Promise.resolve(null),
    user ? listConversations(user.uid, 50).catch(() => []) : Promise.resolve([]),
  ]);

  const structured: StructuredProfile | null =
    assessment?.status === "completed" ? assessment.structured : null;

  const portfolio = portfolioData?.portfolio ?? null;
  const progress = portfolioData?.progress ?? null;

  const name = firstFilled(user?.displayName, portfolio?.personal.fullName, portfolioData?.displayName) || "Your profile";
  const email = firstFilled(user?.email, portfolioData?.email) || "—";
  const username = deriveUsername({ displayName: user?.displayName, email: user?.email, uid: user?.uid });

  const edu = portfolio?.education?.[0] ?? null;
  // Technical/soft skills are two independently-sourced lists (portfolio
  // sections, or Career Discovery's catalog-skills + inferred-strengths
  // split) — each is already unique on its own, but the same skill (e.g.
  // "Leadership") can legitimately appear in both, so the merge needs its
  // own dedupe or downstream renders keyed on the label collide.
  const portfolioSkills = Array.from(
    new Set(
      [
        ...(portfolio?.technicalSkills ?? []).map((s) => s.name),
        ...(portfolio?.softSkills ?? []).map((s) => s.name),
      ].filter(Boolean),
    ),
  );
  const skills = portfolioSkills.length
    ? portfolioSkills.slice(0, 18)
    : Array.from(new Set([...(structured?.technicalSkills ?? []), ...(structured?.softSkills ?? [])])).slice(0, 18);

  return {
    identity: {
      name,
      email,
      username,
      publicPath: publicProfilePath(username),
      publicUrl: publicProfileUrl(username),
      photoURL: user?.photoURL ?? null,
      plan: user?.plan ?? "free",
      role: user?.role ?? "student",
      joined: fmtDate(user?.createdAt),
      lastActive: fmtLastActive(user?.lastActiveAt),
    },
    career: {
      careerGoal: firstFilled(
        portfolio?.personal.careerGoal,
        portfolio?.careerGoals.dreamJob,
        structured?.goals?.aspiration,
      ) || "Not set yet",
      targetCompany: firstFilled(portfolio?.careerGoals.targetCompany) || "Not set yet",
      targetRole: firstFilled(portfolio?.careerGoals.dreamJob, structured?.goals?.targetRoles?.[0]) || "Not set yet",
      college: firstFilled(edu?.school) || "Not set yet",
      degree: firstFilled(edu ? [edu.degree, edu.field].filter(Boolean).join(", ") : "", structured?.education?.level) || "Not set yet",
      gradYear: firstFilled(edu?.endYear) || "—",
      bio: firstFilled(portfolio?.personal.bio) || "",
      skills,
    },
    stats: {
      careerReadiness: analytics?.careerReadiness ?? progress?.careerReadiness ?? 0,
      resumeScore: progress?.resumeCompletion ?? 0,
      roadmapProgress: progress?.roadmapCompletion ?? 0,
      interviewAvg: progress?.interviewPerformance ?? null,
      skillGap: progress?.skillReadiness ?? null,
      coachSessions: conversations.length,
      achievementsUnlocked: analytics?.achievementsUnlocked ?? 0,
      achievementsTotal: analytics?.achievementsTotal ?? 0,
      level: analytics?.level.level ?? 1,
      levelTitle: analytics?.level.title ?? "Explorer",
      streak: analytics?.streak ?? 0,
    },
    hasAssessment: Boolean(structured),
  };
}

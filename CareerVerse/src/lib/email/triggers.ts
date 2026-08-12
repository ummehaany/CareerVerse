import { sendCategoryEmail } from "@/lib/email/dispatcher";
import { EMAIL_ACCENTS } from "@/lib/email/templates/layout";
import {
  buildAchievementEmail,
  buildAssessmentReminderEmail,
  buildAssessmentResultsEmail,
  buildInterviewProgressEmail,
  buildProActivatedEmail,
  buildResumeMilestoneEmail,
  buildRoadmapReadyEmail,
  buildStreakReminderEmail,
  buildWeeklyReportEmail,
  buildWeeklyTaskReminderEmail,
  buildWelcomeEmail,
} from "@/lib/email/templates";
import { filterUnsentKeys, markKeysSent } from "@/lib/firebase/firestore/email-log";
import { getGamification } from "@/lib/firebase/firestore/gamification";
import { addWeeklySnapshot, recordMemoryEvent } from "@/lib/firebase/firestore/memory";
import { getUser } from "@/lib/firebase/firestore/users";
import { isRecentlyActive, isTooNewForReminder } from "@/lib/email/eligibility";
import { getUserAnalyticsSnapshot } from "@/features/analytics/queries";
import { careerReadinessOf, evaluateAchievements, weeklyGoalFor } from "@/features/analytics/engine";
import type { ResumeData } from "@/types/resume";

/**
 * High-level email triggers. Server actions call these fire-and-forget; each is
 * fully self-contained (assembles its own data), never throws, and defers all
 * preference/anti-spam gating to the dispatcher. This keeps the feature actions
 * essentially untouched — a single `void notifyX(...)` line.
 */

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function yesterday(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

/* ── mapping helpers (achievement icon/accent → email visuals) ──────────────*/

const ICON_EMOJI: Record<string, string> = {
  compass: "🧭",
  target: "🎯",
  file: "📄",
  mic: "🎤",
  trophy: "🏆",
  puzzle: "🧩",
  rocket: "🚀",
  flame: "🔥",
  route: "🗺️",
  award: "🏅",
  sparkles: "✨",
};

const ACCENT_HEX: Record<string, string> = {
  "--accent-assessment": EMAIL_ACCENTS.assessment,
  "--accent-roadmap": EMAIL_ACCENTS.roadmap,
  "--accent-resume": EMAIL_ACCENTS.resume,
  "--accent-interview": EMAIL_ACCENTS.interview,
  "--accent-mentor": EMAIL_ACCENTS.mentor,
};

/* ── 🎉 Welcome ─────────────────────────────────────────────────────────────*/
export async function notifyWelcome(uid: string): Promise<void> {
  await sendCategoryEmail(
    uid,
    "welcome",
    ({ user, links }) => buildWelcomeEmail({ name: user.displayName, links }),
    { dedupeKey: "welcome" },
  );
}

/* ── ⭐ Pro activated ────────────────────────────────────────────────────────*/
export async function notifyProActivated(uid: string): Promise<void> {
  await sendCategoryEmail(uid, "proActivated", ({ user, links }) =>
    buildProActivatedEmail({ name: user.displayName, links }),
  );
}

/* ── 🗺️ Roadmap ready ───────────────────────────────────────────────────────*/
export async function notifyRoadmapReady(
  uid: string,
  data: { careerTitle: string; stageCount: number; totalEstimatedTime: string },
): Promise<void> {
  await sendCategoryEmail(uid, "roadmapReady", ({ user, links }) =>
    buildRoadmapReadyEmail({ name: user.displayName, ...data, links }),
  );
}

/* ── 📄 Resume milestone ────────────────────────────────────────────────────*/
function resumeCompletionOf(data: ResumeData): number {
  const c = data.contact;
  const checks = [
    Boolean(c?.fullName?.trim()),
    Boolean(c?.headline?.trim()),
    Boolean(c?.email?.trim()),
    Boolean(data.summary?.trim()),
    (data.experience?.length ?? 0) > 0,
    (data.education?.length ?? 0) > 0,
    (data.skills?.length ?? 0) > 0,
    (data.projects?.length ?? 0) > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

const RESUME_MILESTONES: Array<{ t: number; title: string; body: string }> = [
  { t: 100, title: "Your resume is complete!", body: "Every section is filled in — that's a polished, recruiter-ready resume. Take a moment to be proud of this." },
  { t: 80, title: "Your resume just hit 80%", body: "You're in great shape — this is the level where resumes start getting noticed. A little more polish and you're done." },
  { t: 50, title: "Your resume is halfway there", body: "Solid momentum! You've built a real foundation. Keep adding your experience and projects." },
  { t: 25, title: "You've started your resume", body: "The hardest part is starting — and you've done it. Keep going, one section at a time." },
];

/** Fires at most once per milestone level (dedupe), respecting anti-spam. */
export async function notifyResumeMilestone(uid: string, data: ResumeData, atsScore?: number | null): Promise<void> {
  const completion = resumeCompletionOf(data);
  const level = RESUME_MILESTONES.find((m) => completion >= m.t);
  if (!level) return;
  await sendCategoryEmail(
    uid,
    "resumeMilestone",
    ({ user, links }) =>
      buildResumeMilestoneEmail({
        name: user.displayName,
        milestoneTitle: level.title,
        milestoneBody: level.body,
        completion,
        atsScore,
        links,
      }),
    { dedupeKey: `resume:${level.t}` },
  );
}

/* ── 🎤 Interview progress ──────────────────────────────────────────────────*/
export async function notifyInterviewProgress(
  uid: string,
  data: { role: string; score: number; strengths: string[]; improvements: string[] },
): Promise<void> {
  const strength = data.strengths.find((s) => s.trim()) ?? "You showed up and put in real effort — that's how progress starts.";
  const improvement =
    data.improvements.find((s) => s.trim()) ?? "Add a concrete example or metric to make your answers even more convincing.";
  await sendCategoryEmail(uid, "interviewProgress", ({ user, links }) =>
    buildInterviewProgressEmail({ name: user.displayName, role: data.role, score: data.score, strength, improvement, links }),
  );
}

/* ── 🏆 Achievement sync (grouped, per-badge dedupe) ────────────────────────*/
export async function syncAchievements(uid: string): Promise<void> {
  try {
    const snapshot = await getUserAnalyticsSnapshot(uid);
    const unlocked = evaluateAchievements(snapshot).filter((a) => a.unlocked);
    if (unlocked.length === 0) return;

    const keys = unlocked.map((a) => `ach:${a.id}`);
    const unsent = new Set(await filterUnsentKeys(uid, keys));
    const fresh = unlocked.filter((a) => unsent.has(`ach:${a.id}`));
    if (fresh.length === 0) return;

    const status = await sendCategoryEmail(uid, "achievement", ({ user, links }) =>
      buildAchievementEmail({
        name: user.displayName,
        achievements: fresh.map((a) => ({
          emoji: ICON_EMOJI[a.icon] ?? "🏆",
          title: a.title,
          description: a.description,
          accent: ACCENT_HEX[a.accentVar] ?? EMAIL_ACCENTS.interview,
        })),
        links,
      }),
    );

    // Only "claim" the badges once they were actually sent/logged, so a
    // throttled batch is retried on the next sync rather than lost.
    if (status === "sent" || status === "logged") {
      await markKeysSent(uid, fresh.map((a) => `ach:${a.id}`));
    }
  } catch (error) {
    console.error("[email] syncAchievements failed:", error instanceof Error ? error.message : error);
  }
}

/* ── 📊 Weekly report ───────────────────────────────────────────────────────*/
export async function notifyWeeklyReport(uid: string): Promise<void> {
  try {
    const snapshot = await getUserAnalyticsSnapshot(uid);
    const health = careerReadinessOf(snapshot);
    // Skip brand-new, inactive accounts — nothing meaningful to report yet.
    if (!snapshot.onboardingComplete && health === 0) return;

    const recommendation = weeklyGoalFor(snapshot);

    // AI memory: persist the weekly health snapshot + a timeline point so the
    // mentor can reason about progress over time (fire-and-forget).
    const summary = `Health ${health}, roadmap ${snapshot.roadmapPercent}%, resume ${snapshot.resumeCompletion}%. Next: ${recommendation}.`;
    void addWeeklySnapshot(uid, health, summary);
    void recordMemoryEvent(uid, { type: "healthScore", title: `Career Health Score: ${health}`, detail: recommendation, score: health });

    await sendCategoryEmail(uid, "weeklyReport", ({ user, links }) =>
      buildWeeklyReportEmail({
        name: user.displayName,
        healthScore: health,
        streak: snapshot.streak,
        roadmapPercent: snapshot.roadmapPercent,
        resumeCompletion: snapshot.resumeCompletion,
        skillReadiness: snapshot.skillReadiness,
        interviewBest: snapshot.interviewBest,
        recommendation,
        links,
      }),
    );
  } catch (error) {
    console.error("[email] notifyWeeklyReport failed:", error instanceof Error ? error.message : error);
  }
}

/* ── 🔥 Streak reminder (only when about to lose it) ────────────────────────*/
export async function maybeSendStreakReminder(uid: string): Promise<void> {
  try {
    const g = await getGamification(uid);
    // Meaningful streak, active yesterday, not yet active today = at risk tonight.
    if (g.streak < 3) return;
    if (g.lastActiveDate === today()) return;
    if (g.lastActiveDate !== yesterday()) return;

    await sendCategoryEmail(uid, "streakReminder", ({ user, links }) =>
      buildStreakReminderEmail({ name: user.displayName, streak: g.streak, links }),
    );
  } catch (error) {
    console.error("[email] maybeSendStreakReminder failed:", error instanceof Error ? error.message : error);
  }
}

/* ── 🎉 Career Discovery results ready ───────────────────────────────────────
 * Fired once per completed assessment (basic completion generates results;
 * a later advanced-refinement save reuses the same assessmentId, so the
 * per-assessment dedupe key below naturally prevents a second "results are
 * ready" email for what's really a refinement of the same result set — a
 * genuine retake creates a new assessmentId and is correctly treated as a
 * new event). Never called on assessment *start* — only on a completed save.
 */
export async function notifyAssessmentResultsReady(
  uid: string,
  assessmentId: string,
  topCareerTitle: string | null,
): Promise<void> {
  await sendCategoryEmail(
    uid,
    "assessmentResults",
    ({ user, links }) => buildAssessmentResultsEmail({ name: user.displayName, topCareerTitle, links }),
    { dedupeKey: `assessment-results:${assessmentId}` },
  );
}

/* ── 🧭 Career Discovery reminder (started/eligible, not completed) ─────────
 * Career Discovery itself only persists an answer set once the full flow is
 * submitted (by original design — nothing is saved mid-flow), so there is no
 * server-side "in progress" record to key off. The one reliable, always-
 * available signal for "hasn't finished Career Discovery yet" is the
 * account's own `onboardingComplete` flag, which this same flow is what sets
 * to true on completion. A short account-age grace period avoids nudging
 * someone who signed up minutes ago and hasn't even seen the dashboard; the
 * category's own 7-day cooldown (see email-log.ts) prevents daily spam for a
 * still-unfinished assessment.
 */
export async function notifyPendingAssessment(uid: string): Promise<void> {
  try {
    const user = await getUser(uid);
    if (!user || user.onboardingComplete) return;
    const createdMs = user.createdAt?.toDate?.().getTime() ?? 0;
    if (isTooNewForReminder(createdMs, Date.now())) return;

    await sendCategoryEmail(uid, "assessmentReminder", ({ user: u, links }) =>
      buildAssessmentReminderEmail({ name: u.displayName, links }),
    );
  } catch (error) {
    console.error("[email] notifyPendingAssessment failed:", error instanceof Error ? error.message : error);
  }
}

/* ── ✅ Weekly task reminder (only when genuinely behind) ────────────────────
 * Distinct from the Weekly Career Report (an always-sent digest): this only
 * fires for a student who (a) has already completed Career Discovery — an
 * unfinished assessment is the pending-assessment reminder's job instead —
 * and (b) hasn't been active in the app for a full week, i.e. there's real
 * reason to believe this week's recommended focus (`weeklyGoalFor`, the same
 * deterministic next-best-action function the dashboard and weekly report
 * already use) genuinely hasn't been touched. A student who's been active
 * recently is, by definition, already engaging with their work, so no
 * reminder is sent — this is a real state check, not a scheduled blast.
 */
export async function notifyWeeklyTaskReminder(uid: string): Promise<void> {
  try {
    const user = await getUser(uid);
    if (!user || !user.onboardingComplete) return;

    const lastActiveMs = user.lastActiveAt?.toDate?.().getTime() ?? 0;
    if (isRecentlyActive(lastActiveMs, Date.now())) return;

    const snapshot = await getUserAnalyticsSnapshot(uid);
    const pendingTask = weeklyGoalFor(snapshot);

    await sendCategoryEmail(uid, "weeklyTaskReminder", ({ user: u, links }) =>
      buildWeeklyTaskReminderEmail({ name: u.displayName, pendingTask, links }),
    );
  } catch (error) {
    console.error("[email] notifyWeeklyTaskReminder failed:", error instanceof Error ? error.message : error);
  }
}

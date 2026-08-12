import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { serverEnv } from "@/lib/env.server";
import {
  maybeSendStreakReminder,
  notifyPendingAssessment,
  notifyWeeklyReport,
  notifyWeeklyTaskReminder,
} from "@/lib/email/triggers";
import { resolveCronTasks } from "@/lib/email/cron-tasks";

/**
 * Scheduled endpoint for the recurring emails that aren't tied to a single
 * user action:
 *   - Weekly Career Report (self-throttled to once/6 days per user)
 *   - Streak Reminder (only fires when a user is about to lose a real streak)
 *   - Pending Career Discovery reminder (only for users who haven't
 *     completed it yet, throttled to once/7 days)
 *   - Weekly task reminder (only for onboarded users inactive 7+ days with
 *     genuinely pending work, throttled to roughly once/week)
 *
 * All four are anti-spam gated in the dispatcher (per-category cooldown +
 * dedupe), so it is safe to run this endpoint DAILY — each task re-evaluates
 * its own eligibility every run and simply no-ops when there's nothing to
 * send. Protect it with CRON_SECRET and call it from your scheduler (Vercel
 * Cron, GitHub Actions, cron-job.org, …) with header
 * `Authorization: Bearer <CRON_SECRET>`. If CRON_SECRET is unset the endpoint
 * is disabled (404), so it never runs unconfigured.
 *
 * `?task=weekly|streak|pendingAssessment|weeklyTask|all` (default `all`).
 * `both` is kept as a legacy alias for `weekly+streak` for any scheduler
 * already configured with the old default.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const secret = serverEnv.CRON_SECRET;
  if (!secret) return false;
  return (request.headers.get("authorization") ?? "") === `Bearer ${secret}`;
}

async function run(request: Request) {
  if (!serverEnv.CRON_SECRET) {
    return NextResponse.json({ error: { code: "not-found" } }, { status: 404 });
  }
  if (!authorized(request)) {
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  }

  const task = new URL(request.url).searchParams.get("task") ?? "all";
  const { doWeekly, doStreak, doPendingAssessment, doWeeklyTask } = resolveCronTasks(task);

  try {
    // Only users with an email address are candidates.
    const snap = await adminDb.collection("users").select("email").get();
    let processed = 0;
    for (const doc of snap.docs) {
      const email = doc.get("email");
      if (typeof email !== "string" || !email) continue;
      if (doWeekly) await notifyWeeklyReport(doc.id);
      if (doStreak) await maybeSendStreakReminder(doc.id);
      if (doPendingAssessment) await notifyPendingAssessment(doc.id);
      if (doWeeklyTask) await notifyWeeklyTaskReminder(doc.id);
      processed += 1;
    }
    return NextResponse.json({ ok: true, task, processed });
  } catch (error) {
    console.error("[cron:weekly-report] failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: { code: "cron-failed" } }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}

import { adminDb, FieldValue } from "@/lib/firebase/admin";
import type { EmailCategory } from "@/lib/email/types";

/**
 * Anti-spam send log: `emailLogs/{uid}`. A single per-user document tracks the
 * last-sent time per category, one-time dedupe keys, and a per-day counter.
 * `reserveSend` runs transactionally so concurrent triggers can't double-send.
 *
 * Philosophy: quality over quantity. We fail *closed* on throttle checks (skip
 * rather than risk a duplicate) and fail *open* on infrastructure errors (never
 * block a legitimate email because the log is briefly unavailable).
 */

const COLLECTION = "emailLogs";

/** Minimum hours between two emails of the same category. */
const MIN_INTERVAL_HOURS: Record<EmailCategory, number> = {
  welcome: 0,
  proActivated: 12,
  achievement: 20,
  roadmapReady: 20,
  resumeMilestone: 72,
  interviewProgress: 20,
  weeklyReport: 144,
  streakReminder: 20,
  // One-time-per-event (guarded by an assessment-id dedupe key below); a small
  // interval is still kept as a defense-in-depth backstop against retries.
  assessmentResults: 1,
  // "Don't spam students" is explicit product policy — at most one nudge/week
  // for an unfinished assessment.
  assessmentReminder: 168,
  // Roughly weekly, same cadence as the weekly report.
  weeklyTaskReminder: 144,
};

/**
 * Categories exempt from the "at most one email per day" rule. These are either
 * critical/celebratory (welcome, Pro activation) or the deliberately-cadenced
 * flagship (weekly report), so they always land on their day. Assessment
 * results is a rare, one-time-per-assessment event (protected by its own
 * dedupe key), so it shouldn't be silently swallowed by an unrelated email
 * sent earlier the same day.
 */
const BYPASS_DAILY_CAP = new Set<EmailCategory>(["welcome", "proActivated", "weeklyReport", "assessmentResults"]);

interface EmailLogDoc {
  lastByCategory?: Partial<Record<EmailCategory, number>>;
  dedupe?: Record<string, number>;
  day?: string;
  dayCount?: number;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface ReserveOptions {
  /** One-time key. If already recorded, the send is skipped forever. */
  dedupeKey?: string;
}

/**
 * Atomically decide whether an email may be sent and, if so, record it.
 * Returns true when the caller should proceed to send.
 */
export async function reserveSend(
  uid: string,
  category: EmailCategory,
  opts: ReserveOptions = {},
): Promise<boolean> {
  const ref = adminDb.collection(COLLECTION).doc(uid);
  const now = Date.now();
  const day = today();

  try {
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = (snap.exists ? snap.data() : {}) as EmailLogDoc;

      // 1) One-time dedupe (e.g. welcome, a specific achievement/milestone).
      if (opts.dedupeKey && data.dedupe?.[opts.dedupeKey]) return false;

      // 2) Per-category minimum interval.
      const last = data.lastByCategory?.[category];
      const minMs = MIN_INTERVAL_HOURS[category] * 3_600_000;
      if (last && now - last < minMs) return false;

      // 3) Global daily cap (one email/day) for non-exempt categories.
      const bypass = BYPASS_DAILY_CAP.has(category);
      const dayCount = data.day === day ? data.dayCount ?? 0 : 0;
      if (!bypass && dayCount >= 1) return false;

      // Allowed — record the reservation.
      const lastByCategory = { ...(data.lastByCategory ?? {}), [category]: now };
      const dedupe = opts.dedupeKey
        ? { ...(data.dedupe ?? {}), [opts.dedupeKey]: now }
        : data.dedupe ?? {};

      tx.set(
        ref,
        {
          lastByCategory,
          dedupe,
          day,
          dayCount: bypass ? dayCount : dayCount + 1,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      return true;
    });
  } catch (error) {
    // Fail open: don't let a transient Firestore error suppress a real email.
    console.error("[email] reserveSend failed; allowing send:", error instanceof Error ? error.message : error);
    return true;
  }
}

/**
 * Return the subset of dedupe keys that have NOT been sent yet (read-only).
 * Used by the achievement sync to detect newly-unlocked badges.
 */
export async function filterUnsentKeys(uid: string, keys: string[]): Promise<string[]> {
  if (keys.length === 0) return [];
  try {
    const snap = await adminDb.collection(COLLECTION).doc(uid).get();
    const dedupe = ((snap.exists ? snap.data() : {}) as EmailLogDoc).dedupe ?? {};
    return keys.filter((k) => !dedupe[k]);
  } catch (error) {
    console.error("[email] filterUnsentKeys failed:", error instanceof Error ? error.message : error);
    return keys;
  }
}

/** Mark dedupe keys as sent (called after a grouped email is delivered). */
export async function markKeysSent(uid: string, keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const now = Date.now();
  const patch: Record<string, number> = {};
  for (const k of keys) patch[k] = now;
  try {
    await adminDb
      .collection(COLLECTION)
      .doc(uid)
      .set({ dedupe: patch, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error("[email] markKeysSent failed:", error instanceof Error ? error.message : error);
  }
}

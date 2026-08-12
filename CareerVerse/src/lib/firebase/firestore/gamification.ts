import { cache } from "react";
import { adminDb, FieldValue } from "@/lib/firebase/admin";

// Streak state stored at `users/{uid}/gamification/state`.

export interface GamificationState {
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

function stateRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("gamification").doc("state");
}

function dayString(offsetDays = 0): string {
  return new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);
}

async function getGamification__impl(uid: string): Promise<GamificationState> {
  const snap = await stateRef(uid).get();
  if (!snap.exists) return { streak: 0, longestStreak: 0, lastActiveDate: null };
  const data = snap.data() as Partial<GamificationState>;
  return {
    streak: data.streak ?? 0,
    longestStreak: data.longestStreak ?? 0,
    lastActiveDate: data.lastActiveDate ?? null,
  };
}

/** Record activity for today and update the streak. Idempotent within a day. */
export async function pingActivity(uid: string): Promise<GamificationState> {
  const current = await getGamification(uid);
  const today = dayString(0);
  if (current.lastActiveDate === today) return current;

  const yesterday = dayString(-1);
  const streak = current.lastActiveDate === yesterday ? current.streak + 1 : 1;
  const longestStreak = Math.max(current.longestStreak, streak);

  const next: GamificationState = { streak, longestStreak, lastActiveDate: today };
  await stateRef(uid).set({ ...next, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return next;
}

/** Request-memoized: dedupes identical per-user reads within a single render (I3). */
export const getGamification = cache(getGamification__impl);

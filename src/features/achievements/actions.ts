"use server";

import { verifySession } from "@/lib/firebase/auth";
import { pingActivity } from "@/lib/firebase/firestore/gamification";

export type PingActivityResult =
  | { ok: true; streak: number; longestStreak: number }
  | { ok: false };

/** Record a daily visit and return the updated streak. */
export async function pingActivityAction(): Promise<PingActivityResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false };
    const state = await pingActivity(decoded.uid);
    return { ok: true, streak: state.streak, longestStreak: state.longestStreak };
  } catch {
    return { ok: false };
  }
}

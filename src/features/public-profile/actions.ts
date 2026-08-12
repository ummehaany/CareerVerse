"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { enforceRateLimit } from "@/lib/firebase/firestore/rate-limit";
import {
  incrementProfileStat,
  setProfileAiSummary,
  setProfileSection,
  setProfileVisibility,
} from "@/lib/firebase/firestore/public-profile";
import { ensureUsername, resolveUsername } from "@/lib/firebase/firestore/username";
import { getUser } from "@/lib/firebase/firestore/users";
import { buildMemoryProfile } from "@/lib/memory/service";
import { formatMemoryContext } from "@/lib/memory/context";
import { aiProfileSummary } from "@/lib/ai/services/profile-summary";
import { localProfileSummary } from "@/features/public-profile/service";
import { getInterviewAnalytics } from "@/lib/firebase/firestore/interviews";
import { PUBLIC_SECTIONS, type ProfileVisibility, type PublicSection } from "@/lib/profile/public-config";
import { ROUTES } from "@/config/routes";

export type ProfileActionResult = { ok: true } | { ok: false; error: string };
const EXPIRED = "Your session has expired. Please sign in again." as const;

/** Ensure the signed-in user has a reserved handle; returns it. */
export async function ensureMyUsername(): Promise<{ ok: true; username: string } | { ok: false; error: string }> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    const user = await getUser(decoded.uid);
    const username = await ensureUsername(decoded.uid, user?.displayName, user?.email);
    revalidatePath(ROUTES.settings);
    return { ok: true, username };
  } catch {
    return { ok: false, error: "Couldn't set up your profile link. Please try again." };
  }
}

export async function updateProfileVisibility(visibility: string): Promise<ProfileActionResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    if (!["private", "unlisted", "public"].includes(visibility)) return { ok: false, error: "Invalid visibility." };
    await setProfileVisibility(decoded.uid, visibility as ProfileVisibility);
    revalidatePath(ROUTES.settings);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update visibility. Please try again." };
  }
}

export async function toggleProfileSection(section: string, enabled: boolean): Promise<ProfileActionResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    if (!PUBLIC_SECTIONS.some((s) => s.key === section)) return { ok: false, error: "Unknown section." };
    await setProfileSection(decoded.uid, section as PublicSection, enabled);
    revalidatePath(ROUTES.settings);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update that section. Please try again." };
  }
}

export type SummaryResult = { ok: true; summary: string; source: "ai" | "offline" } | { ok: false; error: string };

export async function regenerateProfileSummary(): Promise<SummaryResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    const _rl = await enforceRateLimit(decoded.uid, "profile-summary", 6);
    if (!_rl.ok) return { ok: false, error: `You're doing that a lot. Please wait ${_rl.retryAfter}s and try again.` };

    const [profile, user, interview] = await Promise.all([
      buildMemoryProfile(decoded.uid),
      getUser(decoded.uid),
      getInterviewAnalytics(decoded.uid).catch(() => ({ count: 0 } as { count: number })),
    ]);
    const name = user?.displayName ?? "This student";

    let summary: string;
    let source: "ai" | "offline";
    try {
      const context = formatMemoryContext(profile) || `Name: ${name}. Goal: ${profile.careerGoal}.`;
      summary = await aiProfileSummary(context);
      if (!summary) throw new Error("empty");
      source = "ai";
    } catch {
      summary = localProfileSummary({
        name,
        careerGoal: profile.careerGoal,
        roadmapPercent: profile.roadmap.percent,
        roadmapExists: profile.roadmap.exists,
        interviewCount: interview.count,
        topSkills: profile.strongSkills.length ? profile.strongSkills : profile.skills,
        weakSkills: profile.weakSkills,
      });
      source = "offline";
    }

    await setProfileAiSummary(decoded.uid, summary);
    revalidatePath(ROUTES.profile);
    return { ok: true, summary, source };
  } catch {
    return { ok: false, error: "Couldn't generate your summary. Please try again." };
  }
}

/* ── Public analytics beacons (no auth; best-effort, owner excluded upstream) ─*/

export async function recordProfileShare(username: string): Promise<void> {
  const uid = await resolveUsername(username);
  if (uid) await incrementProfileStat(uid, "shares");
}

export async function recordResumeDownload(username: string): Promise<void> {
  const uid = await resolveUsername(username);
  if (uid) await incrementProfileStat(uid, "resumeDownloads");
}

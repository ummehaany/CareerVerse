import { cache } from "react";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { normalizeProfileSections, type ProfileVisibility, type PublicSection } from "@/lib/profile/public-config";

/**
 * Public-profile settings live on the user document (so getUser exposes them),
 * while the AI summary and private analytics counters live in a dedicated
 * subdocument `users/{uid}/publicProfile/data` for atomic increments and to
 * keep the user document lean.
 */

function dataRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("publicProfile").doc("data");
}
function userRef(uid: string) {
  return adminDb.collection("users").doc(uid);
}

export interface PublicProfileMeta {
  aiSummary: string | null;
  aiSummaryUpdatedAt: string | null;
  views: number;
  resumeDownloads: number;
  shares: number;
}

async function getPublicProfileMeta__impl(uid: string): Promise<PublicProfileMeta> {
  try {
    const snap = await dataRef(uid).get();
    const d = snap.exists ? snap.data() ?? {} : {};
    return {
      aiSummary: (d.aiSummary as string | undefined) ?? null,
      aiSummaryUpdatedAt: (d.aiSummaryUpdatedAt as string | undefined) ?? null,
      views: (d.views as number | undefined) ?? 0,
      resumeDownloads: (d.resumeDownloads as number | undefined) ?? 0,
      shares: (d.shares as number | undefined) ?? 0,
    };
  } catch {
    return { aiSummary: null, aiSummaryUpdatedAt: null, views: 0, resumeDownloads: 0, shares: 0 };
  }
}
export const getPublicProfileMeta = cache(getPublicProfileMeta__impl);

export async function setProfileVisibility(uid: string, visibility: ProfileVisibility): Promise<void> {
  await userRef(uid).set({ profileVisibility: visibility, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function setProfileSection(uid: string, section: PublicSection, enabled: boolean): Promise<void> {
  await userRef(uid).set(
    { profileSections: { [section]: enabled }, updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
}

export async function setProfileAiSummary(uid: string, summary: string): Promise<void> {
  await dataRef(uid).set(
    { aiSummary: summary, aiSummaryUpdatedAt: new Date().toISOString() },
    { merge: true },
  );
}

/** Atomic private-analytics counters. */
export async function incrementProfileStat(uid: string, field: "views" | "resumeDownloads" | "shares"): Promise<void> {
  try {
    await dataRef(uid).set({ [field]: FieldValue.increment(1) }, { merge: true });
  } catch (error) {
    console.error("[public-profile] increment failed:", error instanceof Error ? error.message : error);
  }
}

/** Read normalized section visibility for a user record. */
export function readSections(user: { profileSections?: Partial<Record<PublicSection, boolean>> } | null | undefined) {
  return normalizeProfileSections(user?.profileSections);
}

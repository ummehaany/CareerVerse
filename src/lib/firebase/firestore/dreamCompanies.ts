import { cache } from "react";
import { adminDb, FieldValue } from "@/lib/firebase/admin";

/*
 * Per-user Target Companies state stored at
 * `users/{uid}/dreamCompanies/state` (collection path retained for data
 * compatibility): saved companies, target companies, and a
 * capped recently-viewed list. Slugs only — company content lives in the
 * catalog, so this stays tiny and scales to hundreds of companies.
 */

export interface DreamCompanyState {
  saved: string[];
  dream: string[];
  recent: string[];
}

const SAVED_CAP = 200;
const RECENT_CAP = 12;

function stateRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("dreamCompanies").doc("state");
}

async function getDreamState__impl(uid: string): Promise<DreamCompanyState> {
  const snap = await stateRef(uid).get();
  if (!snap.exists) return { saved: [], dream: [], recent: [] };
  const d = snap.data() as Partial<DreamCompanyState>;
  return { saved: d.saved ?? [], dream: d.dream ?? [], recent: d.recent ?? [] };
}

export async function toggleSavedCompany(uid: string, slug: string): Promise<boolean> {
  const state = await getDreamState(uid);
  const has = state.saved.includes(slug);
  const saved = has
    ? state.saved.filter((s) => s !== slug)
    : [slug, ...state.saved].slice(0, SAVED_CAP);
  await stateRef(uid).set({ saved, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return !has;
}

/**
 * Seed the dream (Target Companies) list from a source outside this feature —
 * currently, first-run onboarding's "which companies are you targeting?"
 * answer. Only writes when the user has no dream companies yet, so it can
 * never clobber a choice the student already made in Target Companies.
 */
export async function seedDreamCompanies(uid: string, slugs: string[]): Promise<void> {
  if (slugs.length === 0) return;
  const state = await getDreamState(uid);
  if (state.dream.length > 0) return;
  const dream = Array.from(new Set(slugs)).slice(0, SAVED_CAP);
  await stateRef(uid).set({ dream, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function toggleDreamCompany(uid: string, slug: string): Promise<boolean> {
  const state = await getDreamState(uid);
  const has = state.dream.includes(slug);
  const dream = has
    ? state.dream.filter((s) => s !== slug)
    : [slug, ...state.dream].slice(0, SAVED_CAP);
  await stateRef(uid).set({ dream, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return !has;
}

export async function addRecentlyViewed(uid: string, slug: string): Promise<void> {
  const state = await getDreamState(uid);
  const recent = [slug, ...state.recent.filter((s) => s !== slug)].slice(0, RECENT_CAP);
  await stateRef(uid).set({ recent, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

/** Request-memoized: dedupes identical per-user reads within a single render (I3). */
export const getDreamState = cache(getDreamState__impl);

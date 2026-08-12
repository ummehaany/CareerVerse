"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { getCompanyRecord } from "@/lib/companies/catalog";
import {
  addRecentlyViewed,
  toggleDreamCompany,
  toggleSavedCompany,
} from "@/lib/firebase/firestore/dreamCompanies";
import { ROUTES } from "@/config/routes";

export type ToggleResult = { ok: true; active: boolean } | { ok: false };

export async function toggleSavedCompanyAction(slug: string): Promise<ToggleResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false };
    if (!getCompanyRecord(slug)) return { ok: false };
    const active = await toggleSavedCompany(decoded.uid, slug);
    revalidatePath(ROUTES.companies);
    return { ok: true, active };
  } catch {
    return { ok: false };
  }
}

export async function toggleDreamCompanyAction(slug: string): Promise<ToggleResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false };
    if (!getCompanyRecord(slug)) return { ok: false };
    const active = await toggleDreamCompany(decoded.uid, slug);
    revalidatePath(ROUTES.companies);
    return { ok: true, active };
  } catch {
    return { ok: false };
  }
}

/** Fire-and-forget: record that the user viewed a company. */
export async function markCompanyViewedAction(slug: string): Promise<void> {
  try {
    const decoded = await verifySession();
    if (!decoded) return;
    if (!getCompanyRecord(slug)) return;
    await addRecentlyViewed(decoded.uid, slug);
  } catch {
    // best-effort; never blocks the page
  }
}

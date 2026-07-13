"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { savePrimaryResume } from "@/lib/firebase/firestore/resumes";
import { resumeDataSchema } from "./schema";
import { ROUTES } from "@/config/routes";

export type SaveResumeResult = { ok: true } | { ok: false; error: string };

/** Persist the primary resume (called on autosave). */
export async function saveResume(input: unknown): Promise<SaveResumeResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };

    const parsed = resumeDataSchema.parse(input);
    await savePrimaryResume(decoded.uid, parsed);

    revalidatePath(ROUTES.dashboard);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't save your resume. Please try again." };
  }
}

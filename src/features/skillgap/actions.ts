"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { getCareer } from "@/lib/careers/catalog";
import { saveSkillAssessment } from "@/lib/firebase/firestore/skillAssessments";
import { analyzeSkillGap } from "./analysis";
import type { UserSkillInput } from "./types";
import { ROUTES } from "@/config/routes";

const proficiency = z.enum(["beginner", "intermediate", "advanced"]);
const saveSchema = z.object({
  careerSlug: z.string().min(1),
  skills: z.array(z.object({ name: z.string().min(1).max(80), proficiency })).max(120),
});

export type SaveSkillAssessmentResult =
  | { ok: true; id: string; readinessScore: number }
  | { ok: false; error: string };

/** Recompute the analysis server-side and persist a snapshot for progress tracking. */
export async function saveSkillAssessmentAction(input: unknown): Promise<SaveSkillAssessmentResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };

    const parsed = saveSchema.parse(input);
    const career = getCareer(parsed.careerSlug);
    if (!career) return { ok: false, error: "Unknown career." };

    const analysis = analyzeSkillGap(
      {
        slug: career.slug,
        title: career.title,
        category: career.category,
        skills: career.skills,
        difficulty: career.difficulty,
        certifications: career.certifications,
      },
      parsed.skills as UserSkillInput[],
    );

    const { id } = await saveSkillAssessment(decoded.uid, {
      careerSlug: career.slug,
      careerTitle: career.title,
      skills: parsed.skills,
      readinessScore: analysis.readinessScore,
      masteredCount: analysis.mastered.length,
      partialCount: analysis.partial.length,
      missingCount: analysis.missing.length,
      totalRequired: analysis.totalRequired,
    });

    revalidatePath(ROUTES.skillGap);
    revalidatePath(ROUTES.dashboard);
    return { ok: true, id, readinessScore: analysis.readinessScore };
  } catch {
    return { ok: false, error: "Couldn't save your assessment. Please try again." };
  }
}

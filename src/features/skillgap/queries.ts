import { verifySession } from "@/lib/firebase/auth";
import { getCareers } from "@/lib/careers/catalog";
import { getUser } from "@/lib/firebase/firestore/users";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getLatestRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import { listSkillAssessments } from "@/lib/firebase/firestore/skillAssessments";
import type { SkillGapCareer, UserSkillInput } from "./types";
import { getSkillGapReadiness, type SkillGapReadiness } from "./readiness";

export interface SavedAssessmentView {
  id: string;
  careerSlug: string;
  careerTitle: string;
  readinessScore: number;
  createdAtMs: number | null;
}

export interface SkillGapPageData {
  careers: SkillGapCareer[];
  categories: string[];
  defaultCareerSlug: string | null;
  defaultSkills: UserSkillInput[];
  history: SavedAssessmentView[];
  /** Canonical prerequisite state — see features/skillgap/readiness.ts. */
  readiness: SkillGapReadiness;
  /** Career Discovery completion — distinguishes *why* readiness is "not-ready" for messaging. */
  onboardingComplete: boolean;
}

export async function getSkillGapPageData(): Promise<SkillGapPageData> {
  const careers: SkillGapCareer[] = getCareers().map((c) => ({
    slug: c.slug,
    title: c.title,
    category: c.category,
    skills: c.skills,
    difficulty: c.difficulty,
    certifications: c.certifications,
  }));
  const categories = Array.from(new Set(careers.map((c) => c.category))).sort();

  const decoded = await verifySession();
  if (!decoded) {
    return {
      careers,
      categories,
      defaultCareerSlug: careers[0]?.slug ?? null,
      defaultSkills: [],
      history: [],
      readiness: "not-ready",
      onboardingComplete: false,
    };
  }
  const uid = decoded.uid;

  const [user, assessment, recs, saved] = await Promise.all([
    getUser(uid),
    getLatestAssessment(uid),
    getLatestRecommendationSet(uid),
    listSkillAssessments(uid, 10),
  ]);

  let defaultCareerSlug = careers[0]?.slug ?? null;
  const topTitle = recs?.recommendations?.[0]?.title;
  if (topTitle) {
    const t = topTitle.toLowerCase();
    const match =
      careers.find((c) => c.title.toLowerCase() === t) ??
      careers.find((c) => c.title.toLowerCase().includes(t) || t.includes(c.title.toLowerCase()));
    if (match) defaultCareerSlug = match.slug;
  }

  const defaultSkills: UserSkillInput[] = [];
  if (assessment?.structured) {
    const seen = new Set<string>();
    for (const s of [...assessment.structured.technicalSkills, ...assessment.structured.softSkills]) {
      const key = s.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        defaultSkills.push({ name: s, proficiency: "intermediate" });
      }
    }
  }

  const history: SavedAssessmentView[] = saved.map((d) => ({
    id: d.id,
    careerSlug: d.careerSlug,
    careerTitle: d.careerTitle,
    readinessScore: d.readinessScore,
    createdAtMs: d.createdAt ? d.createdAt.toDate().getTime() : null,
  }));

  const onboardingComplete = user?.onboardingComplete ?? false;
  const readiness = getSkillGapReadiness({
    onboardingComplete,
    recommendationsCount: recs?.recommendations.length ?? 0,
    hasHistory: history.length > 0,
  });

  return { careers, categories, defaultCareerSlug, defaultSkills, history, readiness, onboardingComplete };
}

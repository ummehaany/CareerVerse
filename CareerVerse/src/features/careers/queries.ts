import { getCareers, getCareer, CAREER_CATEGORIES } from "@/lib/careers/catalog";
import { getCareerInsights } from "@/lib/firebase/firestore/careerInsights";
import { getFavoriteSlugs } from "@/lib/firebase/firestore/careerFavorites";
import { getSkillProgress } from "@/lib/firebase/firestore/skillProgress";
import { verifySession } from "@/lib/firebase/auth";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { isAIConfigured } from "@/lib/ai";
import type { Career, CareerInsights } from "@/lib/careers/types";

export interface CareersListData {
  careers: Career[];
  categories: string[];
  favoriteSlugs: string[];
}

export async function getCareersListData(): Promise<CareersListData> {
  const decoded = await verifySession();
  const favoriteSlugs = decoded ? await getFavoriteSlugs(decoded.uid) : [];
  return { careers: getCareers(), categories: CAREER_CATEGORIES, favoriteSlugs };
}

export interface CareerDetailData {
  career: Career | null;
  insights: CareerInsights | null;
  userSkills: string[];
  learnedSkills: string[];
  favorited: boolean;
  related: Career[];
  aiConfigured: boolean;
}

export async function getCareerDetailData(slug: string): Promise<CareerDetailData> {
  const career = getCareer(slug);
  const aiConfigured = isAIConfigured();
  if (!career) {
    return {
      career: null,
      insights: null,
      userSkills: [],
      learnedSkills: [],
      favorited: false,
      related: [],
      aiConfigured,
    };
  }

  const related = getCareers()
    .filter((c) => c.category === career.category && c.slug !== career.slug)
    .slice(0, 4);

  const [insights, decoded] = await Promise.all([getCareerInsights(slug), verifySession()]);

  let userSkills: string[] = [];
  let learnedSkills: string[] = [];
  let favorited = false;

  if (decoded) {
    const [assessment, favorites, learned] = await Promise.all([
      getLatestAssessment(decoded.uid),
      getFavoriteSlugs(decoded.uid),
      getSkillProgress(decoded.uid, slug),
    ]);
    if (assessment?.structured) {
      userSkills = [
        ...assessment.structured.technicalSkills,
        ...assessment.structured.softSkills,
        ...assessment.structured.interests,
      ];
    }
    favorited = favorites.includes(slug);
    learnedSkills = learned;
  }

  return { career, insights, userSkills, learnedSkills, favorited, related, aiConfigured };
}

import { verifySession } from "@/lib/firebase/auth";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getCareerDiscovery } from "@/lib/firebase/firestore/careerDiscovery";
import type { CareerMatch, DiscoveryAnswers } from "./types";

export interface DiscoveryEntry {
  assessmentId: string | null;
  completed: boolean;
  advancedCompleted: boolean;
  basicAnswers: DiscoveryAnswers | null;
  advancedAnswers: DiscoveryAnswers | null;
  recommendations: CareerMatch[] | null;
  curiosityNote: string | null;
}

const EMPTY: DiscoveryEntry = {
  assessmentId: null,
  completed: false,
  advancedCompleted: false,
  basicAnswers: null,
  advancedAnswers: null,
  recommendations: null,
  curiosityNote: null,
};

/** Server-side read used by the Career Discovery page to decide intro vs. results. */
export async function getDiscoveryEntry(): Promise<DiscoveryEntry> {
  const decoded = await verifySession();
  if (!decoded) return EMPTY;

  const latest = await getLatestAssessment(decoded.uid);
  if (!latest) return EMPTY;

  const discovery = await getCareerDiscovery(decoded.uid, latest.id);
  if (!discovery) return { ...EMPTY, assessmentId: latest.id };

  return {
    assessmentId: latest.id,
    completed: discovery.completed,
    advancedCompleted: discovery.advancedCompleted,
    basicAnswers: (discovery.basicAnswers as DiscoveryAnswers | undefined) ?? null,
    advancedAnswers: (discovery.advancedAnswers as DiscoveryAnswers | null | undefined) ?? null,
    recommendations: discovery.recommendations ?? null,
    curiosityNote: discovery.curiosityNote ?? null,
  };
}

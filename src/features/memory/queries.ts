import { getCurrentUser } from "@/lib/firebase/auth";
import { isAIConfigured } from "@/lib/ai/index";
import { buildMemoryProfile, buildMemoryTimeline } from "@/lib/memory/service";
import { HIDABLE_FIELDS, LEARNING_STYLES } from "@/lib/memory/types";
import type { MemoryEvent, MemoryProfile } from "@/lib/memory/types";

export interface MemoryDashboardData {
  signedIn: boolean;
  profile: MemoryProfile | null;
  timeline: MemoryEvent[];
  insights: string[];
  aiAvailable: boolean;
  learningStyles: { value: string; label: string }[];
  hidableFields: readonly string[];
}

/** Deterministic, always-available insights derived from the memory profile. */
export function localMemoryInsights(p: MemoryProfile): string[] {
  const out: string[] = [];
  if (!p.assessmentCompleted) {
    out.push("Take the career assessment to unlock personalized guidance across the app.");
  }
  if (p.careerGoal && p.careerGoal !== "Not set yet") {
    out.push(`You're working toward becoming a ${p.careerGoal} — every step is compounding.`);
  }
  if (p.weakSkills.length) {
    out.push(`Focus your next learning block on: ${p.weakSkills.slice(0, 3).join(", ")}.`);
  }
  if (p.resume.exists && p.resume.completion < 80) {
    out.push(`Push your resume past 80% (currently ${p.resume.completion}%) to clear more filters.`);
  }
  if (p.roadmap.exists && p.roadmap.percent < 100) {
    out.push(`You're ${p.roadmap.percent}% through your roadmap — completing the next milestone keeps momentum.`);
  }
  if (p.interview.count === 0) {
    out.push("Try a mock interview to benchmark your readiness and get targeted feedback.");
  } else if (p.interview.best != null) {
    out.push(`Your best interview score is ${p.interview.best}/100 — another round will sharpen it further.`);
  }
  if (p.streak > 0) out.push(`You're on a ${p.streak}-day streak. Consistency is your edge — keep it alive.`);
  if (out.length === 0) out.push("Start with Career Discovery, then build a resume and roadmap to grow your memory profile.");
  return out.slice(0, 4);
}

export async function getMemoryDashboardData(): Promise<MemoryDashboardData> {
  const user = await getCurrentUser();
  if (!user) {
    return { signedIn: false, profile: null, timeline: [], insights: [], aiAvailable: false, learningStyles: LEARNING_STYLES, hidableFields: HIDABLE_FIELDS };
  }
  const [profile, timeline] = await Promise.all([
    buildMemoryProfile(user.uid),
    buildMemoryTimeline(user.uid),
  ]);
  return {
    signedIn: true,
    profile,
    timeline,
    insights: localMemoryInsights(profile),
    aiAvailable: isAIConfigured(),
    learningStyles: LEARNING_STYLES,
    hidableFields: HIDABLE_FIELDS,
  };
}

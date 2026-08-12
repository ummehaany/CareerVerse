/**
 * AI Memory domain types.
 *
 * The memory system is "derive + augment": the authoritative facts already live
 * in the app (assessment, resume, roadmap, interviews, gamification, analytics)
 * and are aggregated at read time into a `MemoryProfile`. Only net-new memory
 * that has no other home is persisted (user overrides, learning style, notes,
 * FAQs, AI-recommendation log, weekly health snapshots, and a stored timeline).
 */

export type LearningStyle = "visual" | "reading" | "hands_on" | "auditory" | "mixed" | "unset";

export const LEARNING_STYLES: { value: LearningStyle; label: string }[] = [
  { value: "unset", label: "Not set" },
  { value: "visual", label: "Visual (diagrams, videos)" },
  { value: "reading", label: "Reading / writing" },
  { value: "hands_on", label: "Hands-on (projects, practice)" },
  { value: "auditory", label: "Auditory (talks, discussion)" },
  { value: "mixed", label: "Mixed" },
];

/** Chronological career event surfaced on the timeline. */
export type MemoryEventType =
  | "assessment"
  | "resume"
  | "roadmap"
  | "interview"
  | "certification"
  | "healthScore"
  | "recommendation"
  | "note"
  | "goal";

export interface MemoryEvent {
  id: string;
  type: MemoryEventType;
  title: string;
  detail?: string;
  /** ISO timestamp. */
  at: string;
  score?: number | null;
  /** "derived" from current data, or "stored" (persisted when it happened). */
  source: "derived" | "stored";
}

export interface MemoryNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface MemoryRecommendation {
  id: string;
  text: string;
  /** Feature that produced it: coach | resume | roadmap | interview | recommendations | weekly. */
  source: string;
  createdAt: string;
}

export interface MemoryFaq {
  id: string;
  question: string;
  count: number;
  lastAskedAt: string;
}

export interface MemoryWeeklySnapshot {
  id: string;
  at: string;
  healthScore: number;
  summary: string;
}

export interface MemoryOverrides {
  careerGoal?: string | null;
  targetCompany?: string | null;
  learningStyle?: LearningStyle;
}

/** Persisted augment document: `users/{uid}/memory/augment`. */
export interface MemoryAugment {
  overrides: MemoryOverrides;
  hiddenFields: string[];
  notes: MemoryNote[];
  recommendations: MemoryRecommendation[];
  faqs: MemoryFaq[];
  weeklySnapshots: MemoryWeeklySnapshot[];
  events: MemoryEvent[];
}

/** Fully assembled, read-only memory used by the dashboard and AI context. */
export interface MemoryProfile {
  uid: string;
  careerGoal: string;
  targetCompanies: string[];
  targetRole: string;
  assessmentCompleted: boolean;
  assessmentSummary: string | null;
  skills: string[];
  strongSkills: string[];
  weakSkills: string[];
  certifications: string[];
  projects: string[];
  resume: { exists: boolean; completion: number; atsScore: number | null; lastUpdated: string | null };
  roadmap: { exists: boolean; title: string | null; percent: number; milestonesDone: number; milestonesTotal: number };
  interview: { count: number; best: number | null; avg: number | null };
  careerHealthScore: number;
  streak: number;
  longestStreak: number;
  learningStyle: LearningStyle;
  faqs: MemoryFaq[];
  recommendations: MemoryRecommendation[];
  weeklySummaries: MemoryWeeklySnapshot[];
  notes: MemoryNote[];
  hiddenFields: string[];
}

/** Field keys a user can hide ("forget") from memory + AI context. */
export const HIDABLE_FIELDS = [
  "careerGoal",
  "targetCompanies",
  "skills",
  "strongSkills",
  "weakSkills",
  "certifications",
  "projects",
  "learningStyle",
] as const;
export type HidableField = (typeof HIDABLE_FIELDS)[number];

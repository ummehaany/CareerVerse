/**
 * Email domain types. Provider-agnostic, mirroring the AI layer's factory
 * abstraction (see src/lib/ai). A "category" maps 1:1 to a template and to a
 * user notification preference, so enabling/disabling or adding a category is a
 * single, contained change.
 */

export type EmailCategory =
  | "welcome"
  | "achievement"
  | "roadmapReady"
  | "resumeMilestone"
  | "interviewProgress"
  | "weeklyReport"
  | "streakReminder"
  | "proActivated"
  | "assessmentResults"
  | "assessmentReminder"
  | "weeklyTaskReminder";

/** Ordered list — drives preference UI and iteration. */
export const EMAIL_CATEGORIES: EmailCategory[] = [
  "welcome",
  "assessmentResults",
  "achievement",
  "roadmapReady",
  "resumeMilestone",
  "interviewProgress",
  "weeklyReport",
  "weeklyTaskReminder",
  "assessmentReminder",
  "streakReminder",
  "proActivated",
];

/** User-facing metadata for each category (consumed by the Settings UI). */
export interface EmailCategoryMeta {
  category: EmailCategory;
  label: string;
  description: string;
  /**
   * Whether the user can turn this category off. Critical/transactional
   * categories (welcome, Pro activation) are always delivered and are shown
   * in Settings as "Always on".
   */
  togglable: boolean;
}

export const EMAIL_CATEGORY_META: Record<EmailCategory, EmailCategoryMeta> = {
  welcome: {
    category: "welcome",
    label: "Welcome",
    description: "A one-time hello when you join CareerVerse.",
    togglable: false,
  },
  achievement: {
    category: "achievement",
    label: "Achievement unlocked",
    description: "When you earn a meaningful badge.",
    togglable: true,
  },
  roadmapReady: {
    category: "roadmapReady",
    label: "Roadmap ready",
    description: "When your personalized career roadmap is generated.",
    togglable: true,
  },
  resumeMilestone: {
    category: "resumeMilestone",
    label: "Resume milestones",
    description: "When your resume reaches a meaningful milestone.",
    togglable: true,
  },
  interviewProgress: {
    category: "interviewProgress",
    label: "Interview progress",
    description: "A short coaching note after a mock interview.",
    togglable: true,
  },
  weeklyReport: {
    category: "weeklyReport",
    label: "Weekly career report",
    description: "Your weekly momentum summary — the flagship email.",
    togglable: true,
  },
  streakReminder: {
    category: "streakReminder",
    label: "Streak reminders",
    description: "A gentle nudge only when you're about to lose a streak.",
    togglable: true,
  },
  proActivated: {
    category: "proActivated",
    label: "Pro activation",
    description: "A confirmation when you upgrade to CareerVerse Pro.",
    togglable: false,
  },
  assessmentResults: {
    category: "assessmentResults",
    label: "Career Discovery results",
    description: "A one-time email when your Career Discovery results are ready.",
    togglable: true,
  },
  assessmentReminder: {
    category: "assessmentReminder",
    label: "Career Discovery reminder",
    description: "A gentle nudge if you started Career Discovery but haven't finished it.",
    togglable: true,
  },
  weeklyTaskReminder: {
    category: "weeklyTaskReminder",
    label: "Weekly task reminder",
    description: "A nudge only when you have pending CareerVerse work and have been away a while.",
    togglable: true,
  },
};

/** Default preferences for a new user (everything on). */
export function defaultEmailPreferences(): Record<EmailCategory, boolean> {
  return {
    welcome: true,
    achievement: true,
    roadmapReady: true,
    resumeMilestone: true,
    interviewProgress: true,
    weeklyReport: true,
    streakReminder: true,
    proActivated: true,
    assessmentResults: true,
    assessmentReminder: true,
    weeklyTaskReminder: true,
  };
}

/**
 * Normalize a possibly-partial stored preferences map into a complete one,
 * defaulting missing keys to enabled. Critical categories are forced on.
 */
export function normalizeEmailPreferences(
  stored: Partial<Record<EmailCategory, boolean>> | undefined | null,
): Record<EmailCategory, boolean> {
  const base = defaultEmailPreferences();
  if (stored) {
    for (const cat of EMAIL_CATEGORIES) {
      if (typeof stored[cat] === "boolean") base[cat] = stored[cat] as boolean;
    }
  }
  // Critical categories are never disabled.
  base.welcome = true;
  base.proActivated = true;
  return base;
}

/** The rendered body of an email (no recipient — the dispatcher adds that). */
export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

/** A fully-addressed message handed to a provider. */
export interface EmailMessage extends EmailContent {
  to: string;
}

export interface EmailSendOutcome {
  ok: boolean;
  id?: string;
  error?: string;
}

/** Provider abstraction — mirrors the AI layer's provider interface. */
export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailSendOutcome>;
}

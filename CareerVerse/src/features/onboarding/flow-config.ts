/*
 * Data-driven configuration for the first-run onboarding flow. Keeping the
 * options, copy, and loading messages here (rather than in the components)
 * makes the flow trivial to extend — add a goal, a field, or a company and the
 * UI updates with no code changes.
 */

export interface Choice {
  /** Stored value (kept human-readable so it personalizes recommendations directly). */
  value: string;
  label: string;
  emoji: string;
  description?: string;
}

/** Step 2 — Career goal (single select). */
export const CAREER_GOALS: Choice[] = [
  { value: "Get an Internship", label: "Get an Internship", emoji: "🎓", description: "Land hands-on experience while you study." },
  { value: "Get a Job", label: "Get a Job", emoji: "💼", description: "Break into your first full-time role." },
  { value: "Switch Career", label: "Switch Career", emoji: "🚀", description: "Move into a new field or industry." },
  { value: "Upskill", label: "Upskill", emoji: "📈", description: "Level up your current skills and title." },
  { value: "I'm Not Sure Yet", label: "I'm Not Sure Yet", emoji: "🤔", description: "Explore and figure it out as you go." },
];

/** Step 3 — Career field (searchable single select). */
export const CAREER_FIELDS: string[] = [
  "Software Development",
  "AI / Machine Learning",
  "Data Science",
  "Cybersecurity",
  "Cloud Computing",
  "UI/UX",
  "Product Management",
  "Business Analytics",
  "Digital Marketing",
  "Other",
];

/**
 * Step 3 sentinel: stored in `careerField` when the student picks "Not sure
 * yet" instead of a real field. Deliberately NOT added to CAREER_FIELDS and
 * not a real field name — it can never be mistaken for one, shown as a fake
 * career/field recommendation, or leak into Career Discovery. Anything that
 * displays or reasons about `careerField` downstream should read it through
 * `resolveCareerField()` rather than using the raw value.
 */
export const CAREER_FIELD_UNDECIDED = "__undecided__";

/** Copy for the "Not sure yet" option, rendered as its own SelectableCard. */
export const CAREER_FIELD_UNDECIDED_OPTION: Choice = {
  value: CAREER_FIELD_UNDECIDED,
  label: "Not sure yet",
  emoji: "🤔",
  description: "That's okay — Career Discovery will help you find the right fit.",
};

/**
 * Resolves a stored `careerField` to a real field name, or `null` for both
 * "never answered" and "picked Not sure yet" — the two states that should be
 * treated identically by anything that isn't the onboarding form itself.
 */
export function resolveCareerField(field: string | null | undefined): string | null {
  return field && field !== CAREER_FIELD_UNDECIDED ? field : null;
}

/** Step 4 — Current level (single select). */
export const CURRENT_LEVELS: Choice[] = [
  { value: "School Student", label: "School Student", emoji: "🏫" },
  { value: "College Student", label: "College Student", emoji: "🎓" },
  { value: "Fresher", label: "Fresher", emoji: "🌱" },
  { value: "Working Professional", label: "Working Professional", emoji: "💼" },
];

/** Step 5 — Dream companies (searchable multi select). */
export const TARGET_COMPANIES: string[] = [
  "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Adobe",
  "Salesforce", "Oracle", "IBM", "Intel", "NVIDIA", "TCS", "Infosys",
  "Wipro", "Accenture", "Capgemini", "Cognizant", "Tech Mahindra", "Others",
];

/**
 * Step 6 — loading messages (rotate every ~2s). Each one describes something
 * this save actually does: goal/field/level feed the AI Career Assistant's
 * context and its pre-Career-Discovery welcome, and target companies seed the
 * Target Companies list. No roadmap is generated here — that still requires
 * Career Discovery — so this list intentionally doesn't claim one.
 */
export const PERSONALIZATION_MESSAGES: string[] = [
  "🤖 Understanding your goals...",
  "🎯 Setting up your target companies...",
  "🧠 Configuring your AI Career Assistant...",
  "💾 Saving your profile...",
  "✅ Almost ready...",
];

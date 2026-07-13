import { ASSESSMENT_VERSION } from "@/types/assessment";
import type { Question, Section, SectionId } from "./types";

export { ASSESSMENT_VERSION };

/**
 * The onboarding assessment. Pure, serializable data (no React) so it can be
 * consumed on both the client (rendering) and the server (validation +
 * normalization). Sections map 1:1 to steps in the flow.
 */
export const SECTIONS: Section[] = [
  { id: "interests", title: "Your Interests", subtitle: "What draws your attention", icon: "compass" },
  { id: "education", title: "Education & Background", subtitle: "Where you're coming from", icon: "book" },
  { id: "technical", title: "Technical Skills", subtitle: "Your hands-on toolkit", icon: "code" },
  { id: "soft", title: "Soft Skills", subtitle: "How you work with others", icon: "chat" },
  { id: "strengths", title: "Strengths & Growth", subtitle: "What you bring, and what's next", icon: "sparkles" },
  { id: "personality", title: "Work Personality", subtitle: "How you're wired", icon: "puzzle" },
  { id: "workstyle", title: "Work Style", subtitle: "Where you do your best work", icon: "briefcase" },
  { id: "values", title: "Values & Motivation", subtitle: "What matters most", icon: "heart" },
  { id: "leadership", title: "Leadership & Problem-Solving", subtitle: "How you drive things forward", icon: "flag" },
  { id: "goals", title: "Learning & Goals", subtitle: "Where you're headed", icon: "rocket" },
];

export const QUESTIONS: Question[] = [
  // ── Interests ────────────────────────────────────────────────────────────
  {
    id: "interestAreas",
    section: "interests",
    type: "multi",
    title: "Which fields genuinely interest you?",
    helpText: "Pick the areas you're naturally curious about.",
    required: true,
    min: 3,
    max: 6,
    display: "cards",
    options: [
      { value: "technology", label: "Technology", description: "Software, apps, systems", icon: "code" },
      { value: "design", label: "Design", description: "Visual, product, UX", icon: "palette" },
      { value: "business", label: "Business", description: "Strategy, operations", icon: "briefcase" },
      { value: "healthcare", label: "Healthcare", description: "Medicine, wellbeing", icon: "heart" },
      { value: "education", label: "Education", description: "Teaching, training", icon: "book" },
      { value: "science", label: "Science", description: "Research, discovery", icon: "beaker" },
      { value: "engineering", label: "Engineering", description: "Building, mechanics", icon: "wrench" },
      { value: "finance", label: "Finance", description: "Investing, analysis", icon: "chart" },
      { value: "marketing", label: "Marketing", description: "Brand, growth", icon: "megaphone" },
      { value: "arts_media", label: "Arts & Media", description: "Content, storytelling", icon: "palette" },
      { value: "social_impact", label: "Social Impact", description: "Community, sustainability", icon: "globe" },
      { value: "law_policy", label: "Law & Policy", description: "Justice, governance", icon: "scale" },
    ],
  },
  {
    id: "workActivities",
    section: "interests",
    type: "multi",
    title: "Which activities energize you the most?",
    required: true,
    min: 2,
    max: 5,
    display: "cards",
    options: [
      { value: "analyzing", label: "Analyzing data", icon: "chart" },
      { value: "building", label: "Building & making", icon: "wrench" },
      { value: "helping", label: "Helping people", icon: "heart" },
      { value: "leading", label: "Leading others", icon: "users" },
      { value: "designing", label: "Designing & creating", icon: "palette" },
      { value: "writing", label: "Writing & communicating", icon: "file" },
      { value: "organizing", label: "Organizing & planning", icon: "layers" },
      { value: "researching", label: "Researching & exploring", icon: "search" },
      { value: "problem_solving", label: "Solving hard problems", icon: "puzzle" },
    ],
  },
  {
    id: "industryDirection",
    section: "interests",
    type: "single",
    title: "If you had to choose one direction, which fits best?",
    required: true,
    display: "cards",
    options: [
      { value: "build", label: "Build & engineer", description: "Create products and systems", icon: "wrench" },
      { value: "analyze", label: "Analyze & research", description: "Find insight in complexity", icon: "chart" },
      { value: "create", label: "Create & design", description: "Craft experiences and stories", icon: "palette" },
      { value: "lead", label: "Lead & manage", description: "Guide people and strategy", icon: "users" },
      { value: "help", label: "Help & serve", description: "Support and care for others", icon: "heart" },
      { value: "grow", label: "Sell & grow", description: "Drive reach and revenue", icon: "megaphone" },
    ],
  },

  // ── Education & Background ────────────────────────────────────────────────
  {
    id: "educationLevel",
    section: "education",
    type: "single",
    title: "What's your highest level of education?",
    required: true,
    display: "cards",
    options: [
      { value: "high_school", label: "High school" },
      { value: "associate", label: "Diploma / Associate" },
      { value: "bachelor", label: "Bachelor's degree" },
      { value: "master", label: "Master's degree" },
      { value: "doctorate", label: "Doctorate" },
      { value: "self_taught", label: "Self-taught / Bootcamp" },
    ],
  },
  {
    id: "fieldOfStudy",
    section: "education",
    type: "single",
    title: "Which field is closest to your background?",
    required: true,
    display: "cards",
    options: [
      { value: "cs_it", label: "Computer Science / IT", icon: "code" },
      { value: "engineering", label: "Engineering", icon: "wrench" },
      { value: "business", label: "Business / Commerce", icon: "briefcase" },
      { value: "arts_humanities", label: "Arts / Humanities", icon: "palette" },
      { value: "sciences", label: "Natural Sciences", icon: "beaker" },
      { value: "health", label: "Health / Medicine", icon: "heart" },
      { value: "social_sciences", label: "Social Sciences", icon: "globe" },
      { value: "other", label: "Other / Undecided", icon: "compass" },
    ],
  },
  {
    id: "currentStatus",
    section: "education",
    type: "single",
    title: "Where are you right now?",
    required: true,
    display: "cards",
    options: [
      { value: "student", label: "Student" },
      { value: "employed", label: "Employed full-time" },
      { value: "freelancing", label: "Freelancing" },
      { value: "job_seeking", label: "Between roles / job-seeking" },
      { value: "career_switch", label: "Switching careers" },
    ],
  },

  // ── Technical Skills ─────────────────────────────────────────────────────
  {
    id: "technicalSkills",
    section: "technical",
    type: "multi",
    title: "Which technical skills do you have some experience with?",
    helpText: "Select all that apply — no expertise required.",
    required: true,
    min: 1,
    display: "chips",
    options: [
      { value: "programming", label: "Programming" },
      { value: "web_dev", label: "Web development" },
      { value: "data_analysis", label: "Data analysis" },
      { value: "ml_ai", label: "Machine learning / AI" },
      { value: "cloud_devops", label: "Cloud / DevOps" },
      { value: "databases", label: "Databases" },
      { value: "cybersecurity", label: "Cybersecurity" },
      { value: "ui_ux", label: "UI / UX design" },
      { value: "graphic_design", label: "Graphic design" },
      { value: "digital_marketing", label: "Digital marketing" },
      { value: "content_writing", label: "Content writing" },
      { value: "spreadsheets", label: "Spreadsheets / Excel" },
      { value: "pm_tools", label: "Project management tools" },
      { value: "no_code", label: "No-code tools" },
      { value: "media_editing", label: "Video / media editing" },
    ],
  },
  {
    id: "technicalProficiency",
    section: "technical",
    type: "scale",
    title: "Overall, how confident are you with technical tools?",
    required: true,
    scale: { min: 1, max: 5, minLabel: "Just starting", maxLabel: "Very confident" },
  },
  {
    id: "learningAgility",
    section: "technical",
    type: "scale",
    title: "How quickly do you pick up new tools and technologies?",
    required: true,
    scale: { min: 1, max: 5, minLabel: "I take my time", maxLabel: "Very quickly" },
  },

  // ── Soft Skills ──────────────────────────────────────────────────────────
  {
    id: "softSkills",
    section: "soft",
    type: "multi",
    title: "Which of these come naturally to you?",
    required: true,
    min: 3,
    display: "chips",
    options: [
      { value: "communication", label: "Communication" },
      { value: "teamwork", label: "Teamwork" },
      { value: "leadership", label: "Leadership" },
      { value: "adaptability", label: "Adaptability" },
      { value: "empathy", label: "Empathy" },
      { value: "time_management", label: "Time management" },
      { value: "critical_thinking", label: "Critical thinking" },
      { value: "conflict_resolution", label: "Conflict resolution" },
      { value: "public_speaking", label: "Public speaking" },
      { value: "negotiation", label: "Negotiation" },
      { value: "active_listening", label: "Active listening" },
      { value: "mentoring", label: "Mentoring" },
    ],
  },
  {
    id: "communicationConfidence",
    section: "soft",
    type: "scale",
    title: "How comfortable are you presenting ideas to a group?",
    required: true,
    scale: { min: 1, max: 5, minLabel: "Prefer not to", maxLabel: "Love it" },
  },

  // ── Strengths & Growth ───────────────────────────────────────────────────
  {
    id: "topStrengths",
    section: "strengths",
    type: "multi",
    title: "What are your greatest strengths?",
    helpText: "Choose up to three.",
    required: true,
    min: 1,
    max: 3,
    display: "cards",
    options: [
      { value: "analytical", label: "Analytical thinking", icon: "chart" },
      { value: "creativity", label: "Creativity", icon: "palette" },
      { value: "organization", label: "Organization", icon: "layers" },
      { value: "persistence", label: "Persistence", icon: "flag" },
      { value: "empathy", label: "Empathy", icon: "heart" },
      { value: "leadership", label: "Leadership", icon: "users" },
      { value: "detail", label: "Attention to detail", icon: "search" },
      { value: "fast_learning", label: "Fast learning", icon: "rocket" },
      { value: "vision", label: "Big-picture vision", icon: "compass" },
      { value: "reliability", label: "Reliability", icon: "shield" },
    ],
  },
  {
    id: "growthAreas",
    section: "strengths",
    type: "multi",
    title: "Which areas would you most like to grow in?",
    helpText: "Choose up to three — everyone has some.",
    required: true,
    min: 1,
    max: 3,
    display: "cards",
    options: [
      { value: "public_speaking", label: "Public speaking", icon: "megaphone" },
      { value: "delegation", label: "Delegation", icon: "users" },
      { value: "boundaries", label: "Setting boundaries", icon: "shield" },
      { value: "technical_depth", label: "Technical depth", icon: "code" },
      { value: "networking", label: "Networking", icon: "globe" },
      { value: "patience", label: "Patience", icon: "clock" },
      { value: "work_life", label: "Work-life balance", icon: "heart" },
      { value: "confidence", label: "Confidence", icon: "sparkles" },
      { value: "focus", label: "Focus & consistency", icon: "target" },
    ],
  },
  {
    id: "selfMotivation",
    section: "strengths",
    type: "scale",
    title: "How self-motivated are you without outside pressure?",
    required: true,
    scale: { min: 1, max: 5, minLabel: "Need a nudge", maxLabel: "Highly driven" },
  },

  // ── Work Personality ─────────────────────────────────────────────────────
  {
    id: "socialEnergy",
    section: "personality",
    type: "single",
    title: "How do you recharge at work?",
    required: true,
    display: "cards",
    options: [
      { value: "solo", label: "Solo & focused", description: "I do my best work heads-down" },
      { value: "mixed", label: "A mix of both", description: "Depends on the day" },
      { value: "social", label: "Around people", description: "Energy comes from others" },
    ],
  },
  {
    id: "decisionStyle",
    section: "personality",
    type: "single",
    title: "When making decisions, what do you lean on?",
    required: true,
    display: "cards",
    options: [
      { value: "analytical", label: "Data & logic", description: "Analyze, then decide" },
      { value: "balanced", label: "A balance", description: "Head and gut together" },
      { value: "intuitive", label: "Gut & experience", description: "Trust the instinct" },
    ],
  },
  {
    id: "structurePreference",
    section: "personality",
    type: "single",
    title: "You do your best work with…",
    required: true,
    display: "cards",
    options: [
      { value: "structured", label: "Clear structure", description: "Plans and defined goals" },
      { value: "flexible_balance", label: "Some of both", description: "Guardrails with freedom" },
      { value: "flexible", label: "Flexibility", description: "Room to improvise" },
    ],
  },

  // ── Work Style ───────────────────────────────────────────────────────────
  {
    id: "collaborationStyle",
    section: "workstyle",
    type: "single",
    title: "How do you prefer to get work done?",
    required: true,
    display: "cards",
    options: [
      { value: "independent", label: "Independently", description: "Own it end to end" },
      { value: "blend", label: "A blend", description: "Solo focus + team sync" },
      { value: "collaborative", label: "Collaboratively", description: "Build it together" },
    ],
  },
  {
    id: "workEnvironment",
    section: "workstyle",
    type: "single",
    title: "Which work setting suits you best?",
    required: true,
    display: "cards",
    options: [
      { value: "remote", label: "Remote" },
      { value: "hybrid", label: "Hybrid" },
      { value: "onsite", label: "On-site" },
      { value: "no_pref", label: "No preference" },
    ],
  },
  {
    id: "workPace",
    section: "workstyle",
    type: "single",
    title: "What pace brings out your best?",
    required: true,
    display: "cards",
    options: [
      { value: "fast", label: "Fast & dynamic", description: "Startup energy" },
      { value: "steady", label: "Steady & structured", description: "Established and stable" },
      { value: "project", label: "Project-based", description: "Varied and milestone-driven" },
    ],
  },

  // ── Values & Motivation ──────────────────────────────────────────────────
  {
    id: "careerValues",
    section: "values",
    type: "multi",
    title: "What do you value most in a career?",
    helpText: "Choose two to four.",
    required: true,
    min: 2,
    max: 4,
    display: "cards",
    options: [
      { value: "impact", label: "Impact", icon: "globe" },
      { value: "stability", label: "Stability", icon: "shield" },
      { value: "growth", label: "Growth & learning", icon: "chart" },
      { value: "autonomy", label: "Autonomy", icon: "compass" },
      { value: "creativity", label: "Creativity", icon: "palette" },
      { value: "compensation", label: "High compensation", icon: "dollar" },
      { value: "work_life", label: "Work-life balance", icon: "heart" },
      { value: "recognition", label: "Recognition", icon: "sparkles" },
      { value: "collaboration", label: "Collaboration", icon: "users" },
      { value: "innovation", label: "Innovation", icon: "lightbulb" },
    ],
  },
  {
    id: "primaryMotivator",
    section: "values",
    type: "single",
    title: "What drives you most right now?",
    required: true,
    display: "cards",
    options: [
      { value: "security", label: "Financial security", icon: "dollar" },
      { value: "impact", label: "Making an impact", icon: "globe" },
      { value: "mastery", label: "Learning & mastery", icon: "chart" },
      { value: "freedom", label: "Freedom & flexibility", icon: "compass" },
      { value: "status", label: "Recognition & status", icon: "sparkles" },
      { value: "expression", label: "Creative expression", icon: "palette" },
    ],
  },

  // ── Leadership & Problem-Solving ─────────────────────────────────────────
  {
    id: "leadershipInterest",
    section: "leadership",
    type: "scale",
    title: "How interested are you in leading or managing others?",
    required: true,
    scale: { min: 1, max: 5, minLabel: "Not for me", maxLabel: "Very interested" },
  },
  {
    id: "teamRole",
    section: "leadership",
    type: "single",
    title: "On a team, which role do you naturally take?",
    required: true,
    display: "cards",
    options: [
      { value: "leader", label: "The organizer", description: "Aligns and drives the plan", icon: "flag" },
      { value: "ideas", label: "The ideas person", description: "Sparks direction", icon: "lightbulb" },
      { value: "executor", label: "The doer", description: "Gets it shipped", icon: "wrench" },
      { value: "supporter", label: "The harmonizer", description: "Keeps the team together", icon: "heart" },
      { value: "analyst", label: "The analyst", description: "Pressure-tests decisions", icon: "chart" },
    ],
  },
  {
    id: "problemSolvingApproach",
    section: "leadership",
    type: "single",
    title: "How do you approach a tough problem?",
    required: true,
    display: "cards",
    options: [
      { value: "creative", label: "Experiment & iterate", description: "Try things, learn fast", icon: "lightbulb" },
      { value: "hybrid", label: "A bit of both", description: "Structured experimentation", icon: "puzzle" },
      { value: "systematic", label: "Follow proven methods", description: "Analyze step by step", icon: "layers" },
    ],
  },
  {
    id: "creativityLevel",
    section: "leadership",
    type: "scale",
    title: "How much do you enjoy open-ended, creative challenges?",
    required: true,
    scale: { min: 1, max: 5, minLabel: "Prefer defined", maxLabel: "Love the ambiguity" },
  },

  // ── Learning & Goals ─────────────────────────────────────────────────────
  {
    id: "learningPreferences",
    section: "goals",
    type: "multi",
    title: "How do you learn best?",
    required: true,
    min: 1,
    display: "cards",
    options: [
      { value: "video", label: "Video courses", icon: "play" },
      { value: "reading", label: "Reading & docs", icon: "book" },
      { value: "hands_on", label: "Hands-on projects", icon: "wrench" },
      { value: "mentorship", label: "Mentorship", icon: "users" },
      { value: "structured", label: "Structured programs", icon: "layers" },
      { value: "peers", label: "Learning with peers", icon: "chat" },
      { value: "microlearning", label: "Bite-sized lessons", icon: "clock" },
    ],
  },
  {
    id: "goalHorizon",
    section: "goals",
    type: "single",
    title: "What's your main focus right now?",
    required: true,
    display: "cards",
    options: [
      { value: "first_role", label: "Landing my first role" },
      { value: "grow_current", label: "Growing in my current field" },
      { value: "switch", label: "Switching careers" },
      { value: "leadership", label: "Advancing to leadership" },
      { value: "explore", label: "Exploring my options" },
    ],
  },
  {
    id: "targetRoles",
    section: "goals",
    type: "multi",
    title: "Any specific roles you're aiming for?",
    helpText: "Optional — pick any that appeal to you.",
    required: false,
    display: "chips",
    options: [
      { value: "software_engineer", label: "Software Engineer" },
      { value: "data_scientist", label: "Data Scientist" },
      { value: "data_analyst", label: "Data Analyst" },
      { value: "product_manager", label: "Product Manager" },
      { value: "ux_designer", label: "UX Designer" },
      { value: "devops_engineer", label: "DevOps Engineer" },
      { value: "ml_engineer", label: "ML Engineer" },
      { value: "marketing_manager", label: "Marketing Manager" },
      { value: "business_analyst", label: "Business Analyst" },
      { value: "consultant", label: "Consultant" },
      { value: "entrepreneur", label: "Entrepreneur" },
      { value: "researcher", label: "Researcher" },
    ],
  },
  {
    id: "careerAspiration",
    section: "goals",
    type: "longtext",
    title: "In a few sentences, what does career success look like for you?",
    helpText: "This helps tailor your future recommendations.",
    required: true,
    minLength: 20,
    maxLength: 600,
    placeholder: "e.g. I want to grow into a role where I solve meaningful problems with a great team, keep learning, and have flexibility over how I work…",
  },
];

const BY_SECTION = SECTIONS.reduce<Record<SectionId, Question[]>>(
  (acc, section) => {
    acc[section.id] = QUESTIONS.filter((q) => q.section === section.id);
    return acc;
  },
  {} as Record<SectionId, Question[]>,
);

export function questionsForSection(sectionId: SectionId): Question[] {
  return BY_SECTION[sectionId] ?? [];
}

export const QUESTIONS_BY_ID: Record<string, Question> = QUESTIONS.reduce<Record<string, Question>>(
  (acc, q) => {
    acc[q.id] = q;
    return acc;
  },
  {},
);

export const TOTAL_QUESTIONS = QUESTIONS.length;
export const TOTAL_REQUIRED = QUESTIONS.filter((q) => q.required).length;
export const TOTAL_STEPS = SECTIONS.length;
/** Rough time budget: ~18s per question. */
export const ESTIMATED_MINUTES = Math.max(1, Math.round((TOTAL_QUESTIONS * 18) / 60));

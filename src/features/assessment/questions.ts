import { ASSESSMENT_VERSION } from "@/types/assessment";
import type { DimensionId } from "./engine/types";
import type { DimensionWeights, Question, Section, SectionId } from "./types";

export { ASSESSMENT_VERSION };

/**
 * The CareerVerse Career Discovery assessment (v2 — full redesign).
 *
 * An original, evidence-informed instrument. It draws on the *principles* behind
 * interest inventories (RIASEC), trait research (Big Five), strengths-based
 * counseling, and type indicators — but every question, option, and weight is
 * original to CareerVerse. Questions are scenario-based wherever possible so the
 * signal comes from how a student would actually behave, not from self-labels.
 *
 * Pure, serializable data (no React) so it is consumed on both the client
 * (rendering) and the server (validation + normalization).
 *
 * Two kinds of questions live here:
 *  1. Direct-capture questions — their ids are the contract read by
 *     buildStructuredProfile(). These ids and answer types MUST stay stable so
 *     recommendations, roadmap, memory, companies, and the public profile keep
 *     working. Their wording/options may evolve; the option LABEL is what flows
 *     downstream.
 *  2. scoringOnly questions — scenario / Likert items. They are never read by
 *     normalization; their option `weights` feed the 15-dimension scoring engine
 *     only. Safe to add/remove/reorder without downstream risk — this is the
 *     extension point for growing the assessment.
 *
 * Option `weights` express how an answer nudges the 15 scoring dimensions.
 */

// ── Likert helper ──────────────────────────────────────────────────────────
// A five-point agree/disagree question whose agreement end carries the weight.
const LIKERT_STEPS: { value: string; label: string; factor: number }[] = [
  { value: "strongly_agree", label: "Strongly agree", factor: 1 },
  { value: "agree", label: "Agree", factor: 0.6 },
  { value: "neutral", label: "Neutral", factor: 0 },
  { value: "disagree", label: "Disagree", factor: 0 },
  { value: "strongly_disagree", label: "Strongly disagree", factor: 0 },
];

function scaleWeights(weights: DimensionWeights, factor: number): DimensionWeights {
  if (factor === 0) return {};
  const out: DimensionWeights = {};
  (Object.keys(weights) as DimensionId[]).forEach((k) => {
    const v = weights[k];
    if (typeof v === "number") out[k] = Math.round(v * factor);
  });
  return out;
}

function likert(
  id: string,
  section: SectionId,
  title: string,
  weights: DimensionWeights,
  helpText?: string,
): Question {
  return {
    id,
    section,
    type: "single",
    title,
    helpText,
    required: false,
    scoringOnly: true,
    display: "cards",
    options: LIKERT_STEPS.map((step) => ({
      value: step.value,
      label: step.label,
      weights: scaleWeights(weights, step.factor),
    })),
  };
}

export const SECTIONS: Section[] = [
  { id: "personality", title: "Personality & Work Preferences", subtitle: "How you naturally operate", icon: "puzzle" },
  { id: "interests", title: "Interests", subtitle: "What genuinely pulls you in", icon: "compass" },
  { id: "problemsolving", title: "Problem-Solving Style", subtitle: "How you think through hard things", icon: "lightbulb" },
  { id: "learning", title: "Learning Style", subtitle: "How you grow fastest", icon: "book" },
  { id: "communication", title: "Communication & Collaboration", subtitle: "How you work with people", icon: "chat" },
  { id: "motivation", title: "Motivation", subtitle: "What really drives you", icon: "heart" },
  { id: "strengths", title: "Strengths & Growth", subtitle: "What you bring, and what's next", icon: "sparkles" },
  { id: "goals", title: "Career Goals & Background", subtitle: "Where you're coming from and headed", icon: "rocket" },
];

export const QUESTIONS: Question[] = [
  // ══ 1. Personality & Work Preferences ═════════════════════════════════════
  {
    id: "socialEnergy",
    section: "personality",
    type: "single",
    title: "After an intense, back-to-back week, what genuinely restores your energy?",
    required: true,
    display: "cards",
    options: [
      { value: "solo", label: "Solo & focused", description: "Quiet, heads-down time to recharge", weights: { independence: 16 } },
      { value: "mixed", label: "A mix of both", description: "Depends on my mood that week", weights: { independence: 6, collaboration: 6 } },
      { value: "social", label: "Around people", description: "Good conversation re-energizes me", weights: { collaboration: 14, communication: 8 } },
    ],
  },
  {
    id: "decisionStyle",
    section: "personality",
    type: "single",
    title: "You have to make an important call before you have all the information. You lean on…",
    required: true,
    display: "cards",
    options: [
      { value: "analytical", label: "Data & logic", description: "Gather what I can, then reason it out", weights: { analyticalThinking: 16 } },
      { value: "balanced", label: "A balance", description: "Weigh the evidence and my instinct together", weights: { analyticalThinking: 6, creativity: 6 } },
      { value: "intuitive", label: "Gut & experience", description: "Trust the pattern I've seen before", weights: { creativity: 12, riskTolerance: 6 } },
    ],
  },
  {
    id: "structurePreference",
    section: "personality",
    type: "single",
    title: "You produce your best work when the path in front of you is…",
    required: true,
    display: "cards",
    options: [
      { value: "structured", label: "Clearly mapped", description: "Defined goals and a plan to follow", weights: { workPreferences: 16 } },
      { value: "flexible_balance", label: "Somewhere in between", description: "Guardrails, with room to move", weights: { workPreferences: 6, riskTolerance: 6 } },
      { value: "flexible", label: "Open-ended", description: "Freedom to figure it out as I go", weights: { riskTolerance: 12, creativity: 8 } },
    ],
  },
  {
    id: "collaborationStyle",
    section: "personality",
    type: "single",
    title: "Handed a meaty piece of work, you'd rather…",
    required: true,
    display: "cards",
    options: [
      { value: "independent", label: "Own it yourself", description: "End to end, your way", weights: { independence: 16 } },
      { value: "blend", label: "Mostly solo, sync often", description: "Focus time plus regular check-ins", weights: { independence: 6, collaboration: 6 } },
      { value: "collaborative", label: "Build it together", description: "Bounce ideas and share the load", weights: { collaboration: 16 } },
    ],
  },
  {
    id: "workEnvironment",
    section: "personality",
    type: "single",
    title: "Where do you tend to do your sharpest thinking?",
    required: true,
    display: "cards",
    options: [
      { value: "remote", label: "Remote", description: "My own space, my own setup", weights: { independence: 8, workPreferences: 4 } },
      { value: "hybrid", label: "Hybrid", description: "A bit of both worlds", weights: { workPreferences: 4 } },
      { value: "onsite", label: "On-site", description: "Energy of people around me", weights: { collaboration: 6 } },
      { value: "no_pref", label: "No strong preference", description: "I adapt to wherever I am" },
    ],
  },
  {
    id: "workPace",
    section: "personality",
    type: "single",
    title: "Which rhythm brings out your best work?",
    required: true,
    display: "cards",
    options: [
      { value: "fast", label: "Fast & dynamic", description: "Fast decisions, quick iteration", weights: { riskTolerance: 14 } },
      { value: "steady", label: "Steady & structured", description: "Consistent, predictable progress", weights: { workPreferences: 14 } },
      { value: "project", label: "Project-based", description: "Bursts around clear milestones", weights: { workPreferences: 6, learningStyle: 4 } },
    ],
  },
  {
    id: "sc_idealDay",
    section: "personality",
    type: "single",
    title: "Your ideal workday is mostly…",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "deep_focus", label: "Deep, uninterrupted focus time", icon: "target", weights: { independence: 14, analyticalThinking: 6 } },
      { value: "varied", label: "A varied mix of tasks and people", icon: "layers", weights: { collaboration: 10, communication: 6 } },
      { value: "collaborative", label: "Solving problems shoulder-to-shoulder", icon: "users", weights: { collaboration: 12, problemSolving: 8 } },
      { value: "leading_others", label: "Coordinating and guiding others", icon: "flag", weights: { leadership: 14, communication: 8 } },
    ],
  },
  {
    id: "sc_projectStart",
    section: "personality",
    type: "single",
    title: "Starting something new, you're happiest when you can…",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "own_endtoend", label: "Own it end-to-end yourself", icon: "compass", weights: { independence: 14, leadership: 6 } },
      { value: "clear_plan", label: "Work from a clear plan and scope", icon: "layers", weights: { workPreferences: 12, analyticalThinking: 8 } },
      { value: "fast_experiment", label: "Move fast and experiment", icon: "rocket", weights: { riskTolerance: 12, creativity: 8 } },
      { value: "team_effort", label: "Build it with a tight team", icon: "users", weights: { collaboration: 12, communication: 8 } },
    ],
  },
  likert(
    "lk_ambiguityComfort",
    "personality",
    "I can keep making progress even when the goal is fuzzy and things are ambiguous.",
    { riskTolerance: 14, problemSolving: 8, independence: 6 },
  ),
  likert(
    "lk_thriveChange",
    "personality",
    "I actually enjoy it when priorities shift and I have to adapt on the fly.",
    { riskTolerance: 14, learningStyle: 8 },
  ),

  // ══ 2. Interests ══════════════════════════════════════════════════════════
  {
    id: "interestAreas",
    section: "interests",
    type: "multi",
    title: "Which of these worlds pull you in — the ones you'd happily read about for fun?",
    helpText: "Pick the areas you're naturally curious about.",
    required: true,
    min: 3,
    max: 6,
    display: "cards",
    options: [
      { value: "technology", label: "Technology", description: "Software, apps, systems", icon: "code", weights: { technicalInclination: 14, problemSolving: 8 } },
      { value: "design", label: "Design", description: "Visual, product, UX", icon: "palette", weights: { creativity: 14, communication: 6 } },
      { value: "business", label: "Business", description: "Strategy, operations", icon: "briefcase", weights: { leadership: 10, analyticalThinking: 8 } },
      { value: "healthcare", label: "Healthcare", description: "Medicine, wellbeing", icon: "heart", weights: { collaboration: 10, communication: 6 } },
      { value: "education", label: "Education", description: "Teaching, training", icon: "book", weights: { communication: 12, collaboration: 8 } },
      { value: "science", label: "Science", description: "Research, discovery", icon: "beaker", weights: { analyticalThinking: 14, problemSolving: 8 } },
      { value: "engineering", label: "Engineering", description: "Building, mechanics", icon: "wrench", weights: { technicalInclination: 12, problemSolving: 10 } },
      { value: "finance", label: "Finance", description: "Investing, analysis", icon: "chart", weights: { analyticalThinking: 14, careerValues: 4 } },
      { value: "marketing", label: "Marketing", description: "Brand, growth", icon: "megaphone", weights: { communication: 12, creativity: 8 } },
      { value: "arts_media", label: "Arts & Media", description: "Content, storytelling", icon: "palette", weights: { creativity: 14, communication: 8 } },
      { value: "social_impact", label: "Social Impact", description: "Community, sustainability", icon: "globe", weights: { collaboration: 10, careerValues: 12 } },
      { value: "law_policy", label: "Law & Policy", description: "Justice, governance", icon: "scale", weights: { communication: 10, analyticalThinking: 10 } },
    ],
  },
  {
    id: "workActivities",
    section: "interests",
    type: "multi",
    title: "Picture your best day of work. Which activities fill most of it?",
    required: true,
    min: 2,
    max: 5,
    display: "cards",
    options: [
      { value: "analyzing", label: "Analyzing data", icon: "chart", weights: { analyticalThinking: 14, problemSolving: 8 } },
      { value: "building", label: "Building & making", icon: "wrench", weights: { technicalInclination: 12, problemSolving: 10 } },
      { value: "helping", label: "Helping people", icon: "heart", weights: { collaboration: 14, communication: 8 } },
      { value: "leading", label: "Leading others", icon: "users", weights: { leadership: 14, communication: 8 } },
      { value: "designing", label: "Designing & creating", icon: "palette", weights: { creativity: 14 } },
      { value: "writing", label: "Writing & communicating", icon: "file", weights: { communication: 14, creativity: 6 } },
      { value: "organizing", label: "Organizing & planning", icon: "layers", weights: { workPreferences: 12, analyticalThinking: 6 } },
      { value: "researching", label: "Researching & exploring", icon: "search", weights: { analyticalThinking: 12, independence: 8 } },
      { value: "problem_solving", label: "Solving hard problems", icon: "puzzle", weights: { problemSolving: 14, analyticalThinking: 8 } },
    ],
  },
  {
    id: "industryDirection",
    section: "interests",
    type: "single",
    title: "If you had to commit to one way of creating value, which feels most like you?",
    required: true,
    display: "cards",
    options: [
      { value: "build", label: "Build & engineer", description: "Create products and systems", icon: "wrench", weights: { technicalInclination: 16, problemSolving: 10 } },
      { value: "analyze", label: "Analyze & research", description: "Find insight in complexity", icon: "chart", weights: { analyticalThinking: 16, problemSolving: 8 } },
      { value: "create", label: "Create & design", description: "Craft experiences and stories", icon: "palette", weights: { creativity: 16, communication: 8 } },
      { value: "lead", label: "Lead & manage", description: "Guide people and strategy", icon: "users", weights: { leadership: 16, communication: 10 } },
      { value: "help", label: "Help & serve", description: "Support and care for others", icon: "heart", weights: { collaboration: 16, communication: 8 } },
      { value: "grow", label: "Sell & grow", description: "Drive reach and revenue", icon: "megaphone", weights: { communication: 14, riskTolerance: 8 } },
    ],
  },
  {
    id: "sc_weekendBuild",
    section: "interests",
    type: "single",
    title: "A free Saturday to make something just for you — you'd most enjoy…",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "ship_prototype", label: "Coding a small app or tool", icon: "code", weights: { technicalInclination: 14, problemSolving: 8, creativity: 4 } },
      { value: "crunch_data", label: "Digging into a dataset you're curious about", icon: "chart", weights: { analyticalThinking: 14, technicalInclination: 6 } },
      { value: "design_thing", label: "Designing a visual or brand concept", icon: "palette", weights: { creativity: 14, communication: 6 } },
      { value: "host_event", label: "Bringing people together for an event", icon: "users", weights: { collaboration: 12, communication: 8, leadership: 6 } },
      { value: "write_piece", label: "Writing an essay, story, or guide", icon: "file", weights: { communication: 14, creativity: 8 } },
      { value: "optimize_system", label: "Streamlining a messy personal system", icon: "layers", weights: { workPreferences: 12, analyticalThinking: 8 } },
    ],
  },
  {
    id: "sc_curiousReading",
    section: "interests",
    type: "single",
    title: "You fall into an internet rabbit hole at midnight. It's most likely about…",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "how_built", label: "How something was engineered or built", icon: "wrench", weights: { technicalInclination: 14, problemSolving: 8 } },
      { value: "why_trend", label: "The data and 'why' behind a trend", icon: "chart", weights: { analyticalThinking: 14 } },
      { value: "beautiful_work", label: "A beautiful piece of design or storytelling", icon: "palette", weights: { creativity: 14, communication: 6 } },
      { value: "company_grew", label: "How a company or founder grew", icon: "briefcase", weights: { leadership: 12, communication: 6, riskTolerance: 4 } },
      { value: "cause", label: "A cause or community you care about", icon: "globe", weights: { careerValues: 14, collaboration: 8 } },
    ],
  },

  // ══ 3. Problem-Solving Style ══════════════════════════════════════════════
  {
    id: "problemSolvingApproach",
    section: "problemsolving",
    type: "single",
    title: "A problem lands on your desk with no obvious answer. Your instinct is to…",
    required: true,
    display: "cards",
    options: [
      { value: "creative", label: "Experiment & iterate", description: "Try things, learn fast", icon: "lightbulb", weights: { creativity: 12, riskTolerance: 8 } },
      { value: "hybrid", label: "A bit of both", description: "Structured experimentation", icon: "puzzle", weights: { problemSolving: 12 } },
      { value: "systematic", label: "Work it methodically", description: "Analyze it step by step", icon: "layers", weights: { analyticalThinking: 12, workPreferences: 8 } },
    ],
  },
  {
    id: "creativityLevel",
    section: "problemsolving",
    type: "scale",
    title: "How much do you enjoy open-ended, creative challenges with no single right answer?",
    required: true,
    scale: { min: 1, max: 5, minLabel: "Prefer defined", maxLabel: "Love the ambiguity" },
  },
  {
    id: "technicalSkills",
    section: "problemsolving",
    type: "multi",
    title: "Which tools or crafts have you actually put your hands on?",
    helpText: "Select all that apply — no expertise required.",
    required: true,
    min: 1,
    display: "chips",
    options: [
      { value: "programming", label: "Programming", weights: { technicalInclination: 12, problemSolving: 6 } },
      { value: "web_dev", label: "Web development", weights: { technicalInclination: 10, creativity: 4 } },
      { value: "data_analysis", label: "Data analysis", weights: { analyticalThinking: 12, technicalInclination: 6 } },
      { value: "ml_ai", label: "Machine learning / AI", weights: { technicalInclination: 12, analyticalThinking: 8 } },
      { value: "cloud_devops", label: "Cloud / DevOps", weights: { technicalInclination: 12 } },
      { value: "databases", label: "Databases", weights: { technicalInclination: 8, analyticalThinking: 8 } },
      { value: "cybersecurity", label: "Cybersecurity", weights: { technicalInclination: 10, problemSolving: 8 } },
      { value: "ui_ux", label: "UI / UX design", weights: { creativity: 12, communication: 6 } },
      { value: "graphic_design", label: "Graphic design", weights: { creativity: 12 } },
      { value: "digital_marketing", label: "Digital marketing", weights: { communication: 10, analyticalThinking: 6 } },
      { value: "content_writing", label: "Content writing", weights: { communication: 12, creativity: 6 } },
      { value: "spreadsheets", label: "Spreadsheets / Excel", weights: { analyticalThinking: 8 } },
      { value: "pm_tools", label: "Project management tools", weights: { leadership: 6, workPreferences: 8 } },
      { value: "no_code", label: "No-code tools", weights: { creativity: 6, technicalInclination: 4 } },
      { value: "media_editing", label: "Video / media editing", weights: { creativity: 10 } },
    ],
  },
  {
    id: "technicalProficiency",
    section: "problemsolving",
    type: "scale",
    title: "When a task needs a tool you've never touched, how do you feel?",
    required: true,
    scale: { min: 1, max: 5, minLabel: "Out of my depth", maxLabel: "Bring it on" },
  },
  {
    id: "sc_brokenTool",
    section: "problemsolving",
    type: "single",
    title: "A tool you rely on breaks mid-task. Your first instinct is to…",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "debug_myself", label: "Dig in and debug it yourself", icon: "wrench", weights: { problemSolving: 12, technicalInclination: 10, independence: 6 } },
      { value: "research_fix", label: "Search docs and forums for a fix", icon: "search", weights: { learningStyle: 10, analyticalThinking: 8 } },
      { value: "ask_someone", label: "Ask someone who'd know", icon: "chat", weights: { collaboration: 12, communication: 8 } },
      { value: "workaround", label: "Find a quick workaround and move on", icon: "rocket", weights: { riskTolerance: 10, workPreferences: 4 } },
    ],
  },
  {
    id: "sc_ambiguousBrief",
    section: "problemsolving",
    type: "single",
    title: "You're handed a vague, open-ended brief. You start by…",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "break_down", label: "Breaking it into a logical structure", icon: "layers", weights: { analyticalThinking: 14, problemSolving: 8 } },
      { value: "sketch_options", label: "Sketching a few different directions", icon: "palette", weights: { creativity: 14, riskTolerance: 4 } },
      { value: "prototype", label: "Building a rough prototype to react to", icon: "rocket", weights: { problemSolving: 10, riskTolerance: 8, technicalInclination: 4 } },
      { value: "define_it", label: "Asking questions until it's well-defined", icon: "chat", weights: { communication: 12, collaboration: 6, analyticalThinking: 4 } },
    ],
  },
  likert(
    "lk_systemsCuriosity",
    "problemsolving",
    "I like understanding how complex systems actually work under the hood.",
    { technicalInclination: 14, analyticalThinking: 10, problemSolving: 8 },
  ),

  // ══ 4. Learning Style ═════════════════════════════════════════════════════
  {
    id: "learningPreferences",
    section: "learning",
    type: "multi",
    title: "When you really want to learn something, what actually works for you?",
    required: true,
    min: 1,
    display: "cards",
    options: [
      { value: "video", label: "Video courses", icon: "play", weights: { learningStyle: 10 } },
      { value: "reading", label: "Reading & docs", icon: "book", weights: { learningStyle: 8, analyticalThinking: 6 } },
      { value: "hands_on", label: "Hands-on projects", icon: "wrench", weights: { learningStyle: 10, technicalInclination: 6 } },
      { value: "mentorship", label: "Mentorship", icon: "users", weights: { collaboration: 8, learningStyle: 6 } },
      { value: "structured", label: "Structured programs", icon: "layers", weights: { workPreferences: 8, learningStyle: 6 } },
      { value: "peers", label: "Learning with peers", icon: "chat", weights: { collaboration: 10 } },
      { value: "microlearning", label: "Bite-sized lessons", icon: "clock", weights: { learningStyle: 8 } },
    ],
  },
  {
    id: "learningAgility",
    section: "learning",
    type: "scale",
    title: "Hand you a brand-new tool and a deadline — how fast do you get productive?",
    required: true,
    scale: { min: 1, max: 5, minLabel: "I take my time", maxLabel: "Very quickly" },
  },
  {
    id: "sc_newSkill",
    section: "learning",
    type: "single",
    title: "Facing a skill you've never used before, you…",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "dive_in", label: "Jump in and learn by doing", icon: "rocket", weights: { learningStyle: 12, riskTolerance: 8, technicalInclination: 4 } },
      { value: "plan_first", label: "Map out a structured learning plan", icon: "layers", weights: { workPreferences: 12, learningStyle: 8 } },
      { value: "find_mentor", label: "Find someone to guide you", icon: "users", weights: { collaboration: 12, learningStyle: 6 } },
      { value: "watch_others", label: "Study how experts do it first", icon: "search", weights: { analyticalThinking: 10, learningStyle: 8 } },
    ],
  },
  {
    id: "sc_stuckLearning",
    section: "learning",
    type: "single",
    title: "You're genuinely stuck learning something hard. What gets you unstuck?",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "more_practice", label: "Just practicing it more, hands-on", icon: "wrench", weights: { learningStyle: 12, technicalInclination: 6 } },
      { value: "the_theory", label: "Going back to the underlying theory", icon: "book", weights: { analyticalThinking: 12, learningStyle: 6 } },
      { value: "ask_help", label: "Asking a mentor or peer to explain", icon: "users", weights: { collaboration: 12, communication: 6 } },
      { value: "new_format", label: "Switching to a different format or teacher", icon: "play", weights: { learningStyle: 10, riskTolerance: 4 } },
    ],
  },
  likert(
    "lk_learnContinuously",
    "learning",
    "I actively seek out new things to learn on my own, without being told to.",
    { learningStyle: 16, motivation: 6, independence: 4 },
  ),

  // ══ 5. Communication & Collaboration ══════════════════════════════════════
  {
    id: "softSkills",
    section: "communication",
    type: "multi",
    title: "Which of these feel effortless — the things people already come to you for?",
    required: true,
    min: 3,
    display: "chips",
    options: [
      { value: "communication", label: "Communication", weights: { communication: 12 } },
      { value: "teamwork", label: "Teamwork", weights: { collaboration: 12 } },
      { value: "leadership", label: "Leadership", weights: { leadership: 12 } },
      { value: "adaptability", label: "Adaptability", weights: { riskTolerance: 10, learningStyle: 8 } },
      { value: "empathy", label: "Empathy", weights: { collaboration: 10, communication: 6 } },
      { value: "time_management", label: "Time management", weights: { workPreferences: 10 } },
      { value: "critical_thinking", label: "Critical thinking", weights: { analyticalThinking: 10, problemSolving: 8 } },
      { value: "conflict_resolution", label: "Conflict resolution", weights: { communication: 8, collaboration: 8 } },
      { value: "public_speaking", label: "Public speaking", weights: { communication: 12, leadership: 6 } },
      { value: "negotiation", label: "Negotiation", weights: { communication: 10, leadership: 6 } },
      { value: "active_listening", label: "Active listening", weights: { communication: 8, collaboration: 8 } },
      { value: "mentoring", label: "Mentoring", weights: { leadership: 8, communication: 8 } },
    ],
  },
  {
    id: "communicationConfidence",
    section: "communication",
    type: "scale",
    title: "You're asked to present to a room on short notice. How do you feel?",
    required: true,
    scale: { min: 1, max: 5, minLabel: "I'd dread it", maxLabel: "I'd love it" },
  },
  {
    id: "teamRole",
    section: "communication",
    type: "single",
    title: "Drop into any team, and you naturally become…",
    required: true,
    display: "cards",
    options: [
      { value: "leader", label: "The organizer", description: "Aligns and drives the plan", icon: "flag", weights: { leadership: 16, workPreferences: 6 } },
      { value: "ideas", label: "The ideas person", description: "Sparks direction", icon: "lightbulb", weights: { creativity: 14, communication: 6 } },
      { value: "executor", label: "The doer", description: "Gets it shipped", icon: "wrench", weights: { problemSolving: 12, workPreferences: 8 } },
      { value: "supporter", label: "The harmonizer", description: "Keeps the team together", icon: "heart", weights: { collaboration: 14 } },
      { value: "analyst", label: "The analyst", description: "Pressure-tests decisions", icon: "chart", weights: { analyticalThinking: 14 } },
    ],
  },
  {
    id: "leadershipInterest",
    section: "communication",
    type: "scale",
    title: "How drawn are you to owning outcomes and guiding a group toward them?",
    required: true,
    scale: { min: 1, max: 5, minLabel: "Not for me", maxLabel: "Very drawn to it" },
  },
  {
    id: "sc_teamConflict",
    section: "communication",
    type: "single",
    title: "Two teammates clash hard on an approach. You tend to…",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "mediate", label: "Help them find common ground", icon: "heart", weights: { communication: 12, collaboration: 10 } },
      { value: "analyze_merits", label: "Lay out the pros and cons objectively", icon: "chart", weights: { analyticalThinking: 12, problemSolving: 6 } },
      { value: "decide", label: "Make the call and keep things moving", icon: "flag", weights: { leadership: 14 } },
      { value: "defer", label: "Support whichever way the group leans", icon: "users", weights: { collaboration: 8 } },
    ],
  },
  {
    id: "sc_persuadeRoom",
    section: "communication",
    type: "single",
    title: "You need to win over a skeptical room. You rely most on…",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "logic", label: "A crisp, logical argument", icon: "layers", weights: { analyticalThinking: 12, communication: 8 } },
      { value: "story", label: "A vivid, relatable story", icon: "palette", weights: { creativity: 12, communication: 10 } },
      { value: "evidence", label: "Hard data and evidence", icon: "chart", weights: { analyticalThinking: 14 } },
      { value: "read_room", label: "Reading the room and adapting live", icon: "users", weights: { communication: 12, collaboration: 8 } },
    ],
  },
  likert(
    "lk_presentEnergy",
    "communication",
    "Presenting ideas to a room energizes me rather than draining me.",
    { communication: 16, leadership: 8 },
  ),
  likert(
    "lk_enjoyResponsibility",
    "communication",
    "I enjoy taking responsibility for outcomes and the decisions behind them.",
    { leadership: 16, motivation: 8 },
  ),

  // ══ 6. Motivation ═════════════════════════════════════════════════════════
  {
    id: "careerValues",
    section: "motivation",
    type: "multi",
    title: "Strip away the salary for a moment — what makes a job feel worth it to you?",
    helpText: "Choose two to four.",
    required: true,
    min: 2,
    max: 4,
    display: "cards",
    options: [
      { value: "impact", label: "Impact", icon: "globe", weights: { careerValues: 14 } },
      { value: "stability", label: "Stability", icon: "shield", weights: { careerValues: 8, workPreferences: 8 } },
      { value: "growth", label: "Growth & learning", icon: "chart", weights: { learningStyle: 12, motivation: 8 } },
      { value: "autonomy", label: "Autonomy", icon: "compass", weights: { independence: 14 } },
      { value: "creativity", label: "Creativity", icon: "palette", weights: { creativity: 14 } },
      { value: "compensation", label: "High compensation", icon: "dollar", weights: { motivation: 12 } },
      { value: "work_life", label: "Work-life balance", icon: "heart", weights: { workPreferences: 12 } },
      { value: "recognition", label: "Recognition", icon: "sparkles", weights: { motivation: 10 } },
      { value: "collaboration", label: "Collaboration", icon: "users", weights: { collaboration: 12 } },
      { value: "innovation", label: "Innovation", icon: "lightbulb", weights: { creativity: 10, riskTolerance: 8 } },
    ],
  },
  {
    id: "primaryMotivator",
    section: "motivation",
    type: "single",
    title: "Be honest — what's really pulling you forward right now?",
    required: true,
    display: "cards",
    options: [
      { value: "security", label: "Financial security", icon: "dollar", weights: { careerValues: 10, workPreferences: 8 } },
      { value: "impact", label: "Making an impact", icon: "globe", weights: { careerValues: 16 } },
      { value: "mastery", label: "Learning & mastery", icon: "chart", weights: { learningStyle: 14, motivation: 8 } },
      { value: "freedom", label: "Freedom & flexibility", icon: "compass", weights: { independence: 14, riskTolerance: 8 } },
      { value: "status", label: "Recognition & status", icon: "sparkles", weights: { motivation: 12, leadership: 8 } },
      { value: "expression", label: "Creative expression", icon: "palette", weights: { creativity: 16 } },
    ],
  },
  {
    id: "sc_jobChoice",
    section: "motivation",
    type: "single",
    title: "Two job offers, identical pay. You'd pick the one with…",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "big_impact", label: "The clearest real-world impact", icon: "globe", weights: { careerValues: 14, motivation: 6 } },
      { value: "learning", label: "The steepest learning curve", icon: "chart", weights: { learningStyle: 14, motivation: 6 } },
      { value: "autonomy", label: "The most freedom over your work", icon: "compass", weights: { independence: 14, riskTolerance: 6 } },
      { value: "stability", label: "The most stability and balance", icon: "shield", weights: { workPreferences: 12, careerValues: 6 } },
      { value: "creative_freedom", label: "The most room to create", icon: "palette", weights: { creativity: 14 } },
    ],
  },
  {
    id: "sc_proudOf",
    section: "motivation",
    type: "single",
    title: "Think of a recent win that made you genuinely proud. It was because you…",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "solved_hard", label: "Cracked a genuinely hard problem", icon: "puzzle", weights: { problemSolving: 14, analyticalThinking: 6 } },
      { value: "made_original", label: "Created something original", icon: "palette", weights: { creativity: 14 } },
      { value: "helped_succeed", label: "Helped someone else succeed", icon: "heart", weights: { collaboration: 12, careerValues: 8 } },
      { value: "led_result", label: "Led a group to a real result", icon: "flag", weights: { leadership: 14, communication: 6 } },
    ],
  },
  likert(
    "lk_meaningOverMoney",
    "motivation",
    "Meaningful work matters more to me than maximizing my income.",
    { careerValues: 16, collaboration: 4 },
  ),

  // ══ 7. Strengths & Growth ═════════════════════════════════════════════════
  {
    id: "topStrengths",
    section: "strengths",
    type: "multi",
    title: "When you're at your best, what are people actually seeing?",
    helpText: "Choose up to three.",
    required: true,
    min: 1,
    max: 3,
    display: "cards",
    options: [
      { value: "analytical", label: "Analytical thinking", icon: "chart", weights: { analyticalThinking: 14, problemSolving: 8 } },
      { value: "creativity", label: "Creativity", icon: "palette", weights: { creativity: 14 } },
      { value: "organization", label: "Organization", icon: "layers", weights: { workPreferences: 14 } },
      { value: "persistence", label: "Persistence", icon: "flag", weights: { motivation: 14 } },
      { value: "empathy", label: "Empathy", icon: "heart", weights: { collaboration: 12, communication: 6 } },
      { value: "leadership", label: "Leadership", icon: "users", weights: { leadership: 14 } },
      { value: "detail", label: "Attention to detail", icon: "search", weights: { analyticalThinking: 10, workPreferences: 8 } },
      { value: "fast_learning", label: "Fast learning", icon: "rocket", weights: { learningStyle: 14 } },
      { value: "vision", label: "Big-picture vision", icon: "compass", weights: { leadership: 10, creativity: 8 } },
      { value: "reliability", label: "Reliability", icon: "shield", weights: { workPreferences: 10, motivation: 8 } },
    ],
  },
  {
    id: "growthAreas",
    section: "strengths",
    type: "multi",
    title: "Which of these would make the biggest difference if you leveled it up?",
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
    title: "No one's checking in and the deadline is weeks away. How's your momentum?",
    required: true,
    scale: { min: 1, max: 5, minLabel: "Need a nudge", maxLabel: "Highly driven" },
  },
  {
    id: "sc_toughFeedback",
    section: "strengths",
    type: "single",
    title: "You get tough, direct feedback on something you worked hard on. Honestly, you…",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "improve", label: "Get to work improving it right away", icon: "rocket", weights: { motivation: 12, learningStyle: 8 } },
      { value: "assess", label: "Weigh how fair and useful it is", icon: "chart", weights: { analyticalThinking: 12 } },
      { value: "discuss", label: "Talk it through to understand it fully", icon: "chat", weights: { communication: 10, collaboration: 8 } },
      { value: "feel_then_act", label: "Feel it for a bit, then act on it", icon: "heart", weights: { motivation: 8, collaboration: 4 } },
    ],
  },
  {
    id: "sc_underPressure",
    section: "strengths",
    type: "single",
    title: "A deadline is closing in fast. At your best, you…",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "prioritize", label: "Get systematic and ruthlessly prioritize", icon: "layers", weights: { workPreferences: 12, analyticalThinking: 8 } },
      { value: "rally", label: "Rally the team and divide it up", icon: "users", weights: { leadership: 12, collaboration: 8 } },
      { value: "grind", label: "Go heads-down and grind it out", icon: "target", weights: { independence: 12, motivation: 8 } },
      { value: "shortcut", label: "Find a clever shortcut to the goal", icon: "lightbulb", weights: { creativity: 10, riskTolerance: 8 } },
    ],
  },
  likert(
    "lk_finishWhatStart",
    "strengths",
    "I push through and finish what I start, even when it stops being fun.",
    { motivation: 16, workPreferences: 8 },
  ),

  // ══ 8. Career Goals & Background ══════════════════════════════════════════
  {
    id: "educationLevel",
    section: "goals",
    type: "single",
    title: "What's your highest level of education so far?",
    required: true,
    display: "cards",
    options: [
      { value: "high_school", label: "High school" },
      { value: "associate", label: "Diploma / Associate" },
      { value: "bachelor", label: "Bachelor's degree" },
      { value: "master", label: "Master's degree" },
      { value: "doctorate", label: "Doctorate", weights: { analyticalThinking: 8 } },
      { value: "self_taught", label: "Self-taught / Bootcamp", weights: { learningStyle: 10, independence: 8 } },
    ],
  },
  {
    id: "fieldOfStudy",
    section: "goals",
    type: "single",
    title: "Which field is closest to your background?",
    required: true,
    display: "cards",
    options: [
      { value: "cs_it", label: "Computer Science / IT", icon: "code", weights: { technicalInclination: 12 } },
      { value: "engineering", label: "Engineering", icon: "wrench", weights: { technicalInclination: 10, problemSolving: 8 } },
      { value: "business", label: "Business / Commerce", icon: "briefcase", weights: { leadership: 8, analyticalThinking: 8 } },
      { value: "arts_humanities", label: "Arts / Humanities", icon: "palette", weights: { creativity: 10, communication: 8 } },
      { value: "sciences", label: "Natural Sciences", icon: "beaker", weights: { analyticalThinking: 12 } },
      { value: "health", label: "Health / Medicine", icon: "heart", weights: { collaboration: 8 } },
      { value: "social_sciences", label: "Social Sciences", icon: "globe", weights: { communication: 8, collaboration: 6 } },
      { value: "other", label: "Other / Undecided", icon: "compass" },
    ],
  },
  {
    id: "currentStatus",
    section: "goals",
    type: "single",
    title: "Where are you right now?",
    required: true,
    display: "cards",
    options: [
      { value: "student", label: "Student", weights: { learningStyle: 6 } },
      { value: "employed", label: "Employed full-time" },
      { value: "freelancing", label: "Freelancing", weights: { independence: 10, riskTolerance: 8 } },
      { value: "job_seeking", label: "Between roles / job-seeking" },
      { value: "career_switch", label: "Switching careers", weights: { riskTolerance: 8, learningStyle: 8 } },
    ],
  },
  {
    id: "goalHorizon",
    section: "goals",
    type: "single",
    title: "What's the main thing you're trying to make happen right now?",
    required: true,
    display: "cards",
    options: [
      { value: "first_role", label: "Landing my first role", weights: { motivation: 10 } },
      { value: "grow_current", label: "Growing in my current field", weights: { motivation: 8, learningStyle: 6 } },
      { value: "switch", label: "Switching careers", weights: { riskTolerance: 10, learningStyle: 8 } },
      { value: "leadership", label: "Advancing to leadership", weights: { leadership: 14 } },
      { value: "explore", label: "Exploring my options", weights: { learningStyle: 6 } },
    ],
  },
  {
    id: "sc_pathChoice",
    section: "goals",
    type: "single",
    title: "Which path is most exciting to imagine yourself on?",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "startup", label: "Joining a fast-moving startup", icon: "rocket", weights: { riskTolerance: 14, leadership: 6 } },
      { value: "mnc", label: "A top company or large MNC", icon: "briefcase", weights: { workPreferences: 10, motivation: 8 } },
      { value: "research", label: "Research or higher studies", icon: "beaker", weights: { analyticalThinking: 12, independence: 8 } },
      { value: "public", label: "Government or public service", icon: "globe", weights: { careerValues: 12, collaboration: 6 } },
      { value: "founder", label: "Freelancing or building your own thing", icon: "compass", weights: { independence: 12, riskTolerance: 10, creativity: 6 } },
    ],
  },
  {
    id: "targetRoles",
    section: "goals",
    type: "multi",
    title: "Any roles already on your radar?",
    helpText: "Optional — pick any that appeal to you.",
    required: false,
    display: "chips",
    options: [
      { value: "software_engineer", label: "Software Engineer", weights: { technicalInclination: 10, problemSolving: 6 } },
      { value: "data_scientist", label: "Data Scientist", weights: { analyticalThinking: 10, technicalInclination: 6 } },
      { value: "data_analyst", label: "Data Analyst", weights: { analyticalThinking: 10 } },
      { value: "product_manager", label: "Product Manager", weights: { leadership: 8, communication: 8 } },
      { value: "ux_designer", label: "UX Designer", weights: { creativity: 10, communication: 6 } },
      { value: "devops_engineer", label: "DevOps Engineer", weights: { technicalInclination: 10 } },
      { value: "ml_engineer", label: "ML Engineer", weights: { technicalInclination: 10, analyticalThinking: 6 } },
      { value: "marketing_manager", label: "Marketing Manager", weights: { communication: 10, leadership: 6 } },
      { value: "business_analyst", label: "Business Analyst", weights: { analyticalThinking: 8, communication: 6 } },
      { value: "consultant", label: "Consultant", weights: { communication: 8, analyticalThinking: 6 } },
      { value: "entrepreneur", label: "Entrepreneur", weights: { riskTolerance: 12, leadership: 8 } },
      { value: "researcher", label: "Researcher", weights: { analyticalThinking: 10, independence: 8 } },
    ],
  },
  {
    id: "sc_growthPath",
    section: "goals",
    type: "single",
    title: "Five years out, success looks most like…",
    required: false,
    scoringOnly: true,
    display: "cards",
    options: [
      { value: "deep_expert", label: "Being a deep expert in your craft", icon: "target", weights: { technicalInclination: 12, analyticalThinking: 8, independence: 4 } },
      { value: "leading_teams", label: "Leading teams and strategy", icon: "flag", weights: { leadership: 14, communication: 8 } },
      { value: "building_own", label: "Building something of your own", icon: "rocket", weights: { riskTolerance: 12, creativity: 8, leadership: 6 } },
      { value: "broad_impact", label: "Driving broad impact for people", icon: "globe", weights: { careerValues: 14, collaboration: 8 } },
    ],
  },
  {
    id: "careerAspiration",
    section: "goals",
    type: "longtext",
    title: "In your own words, what does career success look like for you?",
    helpText: "A few honest sentences — this personalizes everything that follows.",
    required: false,
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
/** Rough time budget: ~16s per question. */
export const ESTIMATED_MINUTES = Math.max(1, Math.round((TOTAL_QUESTIONS * 16) / 60));

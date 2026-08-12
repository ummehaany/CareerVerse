import { QUESTIONS, QUESTIONS_BY_ID } from "@/features/assessment/questions";
import type { Question, SectionId } from "@/features/assessment/types";
import type { DimensionId } from "@/features/assessment/engine/types";
import type { Answers } from "@/types/assessment";

/**
 * Career Discovery — deterministic adaptive conversation engine.
 *
 * Rather than a fixed "question N of M" list, the engine builds a per-student
 * plan from the assessment question bank: it always collects the direct-capture
 * (contract) questions that power StructuredProfile, and then selects the
 * scenario questions most RELEVANT to the student's chosen interests — so two
 * students get different paths, and students with focused interests finish
 * sooner. Pure and synchronous; the AI is only used for the final report.
 */

const MAX_SCENARIOS = 8;
const MIN_SCENARIOS = 4;

/** Interests → the scoring dimensions they emphasize (summed from option weights). */
function emphasizedDimensions(answers: Answers): Partial<Record<DimensionId, number>> {
  const emphasis: Partial<Record<DimensionId, number>> = {};
  const add = (questionId: string) => {
    const q = QUESTIONS_BY_ID[questionId];
    const value = answers[questionId];
    const selected = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
    for (const v of selected) {
      const opt = q?.options?.find((o) => o.value === v);
      if (!opt?.weights) continue;
      (Object.keys(opt.weights) as DimensionId[]).forEach((d) => {
        emphasis[d] = (emphasis[d] ?? 0) + (opt.weights![d] ?? 0);
      });
    }
  };
  add("interestAreas");
  add("workActivities");
  add("industryDirection");
  return emphasis;
}

/** How well a scenario question aligns with the student's emphasized dimensions. */
function relevance(question: Question, emphasis: Partial<Record<DimensionId, number>>): number {
  let score = 0;
  for (const opt of question.options ?? []) {
    if (!opt.weights) continue;
    (Object.keys(opt.weights) as DimensionId[]).forEach((d) => {
      score += (opt.weights![d] ?? 0) * (emphasis[d] ?? 0);
    });
  }
  return score;
}

export function isAnswered(answers: Answers, q: Question): boolean {
  if (!(q.id in answers)) return false;
  const v = answers[q.id];
  if (!q.required) return true; // any recorded value counts (incl. an intentional skip)
  if (Array.isArray(v)) return v.length >= (q.min ?? 1);
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return true;
  return false;
}

const OPENER = "interestAreas";

/**
 * Build the ordered plan of questions for this student. Before interests are
 * chosen the plan is just the opener; afterwards it is the contract questions
 * plus the most relevant scenarios, in a natural conversational order.
 */
export function buildPlan(answers: Answers): Question[] {
  const opener = QUESTIONS_BY_ID[OPENER]!;
  if (!isAnswered(answers, opener)) return [opener];

  const emphasis = emphasizedDimensions(answers);
  const scenarios = QUESTIONS.filter((q) => q.scoringOnly);
  const ranked = scenarios
    .map((q) => ({ q, score: relevance(q, emphasis) }))
    .sort((a, b) => b.score - a.score);

  const relevant = ranked.filter((r) => r.score > 0).slice(0, MAX_SCENARIOS).map((r) => r.q);
  const chosenScenarios = relevant.length >= MIN_SCENARIOS ? relevant : ranked.slice(0, MIN_SCENARIOS).map((r) => r.q);

  const include = new Set<string>([OPENER]);
  for (const q of QUESTIONS) {
    if (q.required) include.add(q.id); // all contract questions
    if (q.id === "targetRoles") include.add(q.id); // optional but valuable
  }
  for (const q of chosenScenarios) include.add(q.id);

  // Order: opener first, then the rest by the bank's section-grouped order.
  const rest = QUESTIONS.filter((q) => include.has(q.id) && q.id !== OPENER);
  return [opener, ...rest];
}

export interface DiscoveryStep {
  question: Question;
  index: number;
  total: number;
  isLast: boolean;
}

export function nextStep(answers: Answers): DiscoveryStep | null {
  const plan = buildPlan(answers);
  const total = plan.length > 1 ? plan.length : 30; // rough estimate before interests chosen
  const idx = plan.findIndex((q) => !isAnswered(answers, q));
  if (idx === -1) return null;
  const answeredCount = plan.filter((q) => isAnswered(answers, q)).length;
  return { question: plan[idx]!, index: answeredCount, total, isLast: idx === plan.length - 1 };
}

/* ── Conversational copy ─────────────────────────────────────────────────────*/

const SECTION_INTRO: Record<SectionId, string> = {
  interests: "Let's start with what pulls you in.",
  personality: "Great. Now, a little about how you naturally work.",
  problemsolving: "Let's see how your mind tackles a challenge.",
  learning: "Everyone grows differently — how about you?",
  communication: "Now, how you click with other people.",
  motivation: "Let's get to what really drives you.",
  strengths: "Almost there — let's talk about your strengths.",
  goals: "Last stretch: where you're headed.",
};

/** Warm lead-in shown above a question when a new topic begins. */
export function transitionFor(prev: Question | null, next: Question): string | null {
  if (!prev) return SECTION_INTRO[next.section] ?? null;
  if (prev.section !== next.section) return SECTION_INTRO[next.section] ?? null;
  return null;
}

/** Acknowledge the student's interests right after they pick them. */
export function acknowledgeInterests(answers: Answers): string | null {
  const value = answers.interestAreas;
  if (!Array.isArray(value) || value.length === 0) return null;
  const q = QUESTIONS_BY_ID.interestAreas;
  const labels = value
    .map((v) => q?.options?.find((o) => o.value === v)?.label)
    .filter((l): l is string => Boolean(l));
  if (labels.length === 0) return null;
  const list =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
  return `Awesome — I can already see you're drawn to ${list}. Let's get to know you a little more.`;
}

/* ── Progress ────────────────────────────────────────────────────────────────*/

export interface DiscoveryPhase {
  key: string;
  label: string;
  status: "done" | "active" | "upcoming";
}

const PHASE_LABEL: Record<SectionId, string> = {
  interests: "Discovering your interests",
  personality: "How you naturally work",
  problemsolving: "How you solve problems",
  learning: "How you learn best",
  communication: "Working with people",
  motivation: "What drives you",
  strengths: "Your strengths",
  goals: "Your goals & background",
};

export function buildProgress(answers: Answers, finishing = false): DiscoveryPhase[] {
  const plan = buildPlan(answers);
  const sections: SectionId[] = [];
  for (const q of plan) if (!sections.includes(q.section)) sections.push(q.section);

  let activeAssigned = false;
  const phases: DiscoveryPhase[] = sections.map((sid) => {
    const qs = plan.filter((q) => q.section === sid);
    const done = qs.every((q) => isAnswered(answers, q));
    let status: DiscoveryPhase["status"];
    if (done) status = "done";
    else if (!activeAssigned) {
      status = "active";
      activeAssigned = true;
    } else status = "upcoming";
    return { key: sid, label: PHASE_LABEL[sid], status };
  });

  phases.push({
    key: "profile",
    label: "Building your career profile",
    status: finishing ? "active" : "upcoming",
  });
  return phases;
}

/* ── Conversational (chat) flow ──────────────────────────────────────────────*/

const ABOUT_YOU = "careerAspiration"; // the free-text opener ("tell me about yourself")

/**
 * The chat plan opens with a free-text "tell me about yourself", then interests
 * (as cards, optionally pre-filled from what they typed), then the adaptive
 * remainder. This is the order the conversational experience walks.
 */
export function conversationalPlan(answers: Answers): Question[] {
  const about = QUESTIONS_BY_ID[ABOUT_YOU]!;
  const interests = QUESTIONS_BY_ID[OPENER]!;
  if (!isAnswered(answers, interests)) return [about, interests];
  const base = buildPlan(answers);
  const rest = base.filter((q) => q.id !== OPENER && q.id !== ABOUT_YOU);
  return [about, interests, ...rest];
}

export function nextConversationStep(answers: Answers): DiscoveryStep | null {
  const plan = conversationalPlan(answers);
  const total = plan.length > 2 ? plan.length : 16;
  const idx = plan.findIndex((q) => !isAnswered(answers, q));
  if (idx === -1) return null;
  const answeredCount = plan.filter((q) => isAnswered(answers, q)).length;
  return { question: plan[idx]!, index: answeredCount, total, isLast: idx === plan.length - 1 };
}

/** Whether a question is the free-text opener. */
export function isAboutYou(question: Question): boolean {
  return question.id === ABOUT_YOU;
}

/** The allowed interest option values (for AI extraction from free text). */
export function interestOptionValues(): { value: string; label: string }[] {
  return (QUESTIONS_BY_ID[OPENER]?.options ?? []).map((o) => ({ value: o.value, label: o.label }));
}

/** A short intent hint the AI uses to phrase the next question naturally. */
export function topicIntent(question: Question): string {
  return question.title;
}

/** Deterministic fallback acknowledgement + lead-in when AI is unavailable. */
export function fallbackReply(prev: Question | null, next: Question): string {
  const intro = transitionFor(prev, next);
  return intro ? `${intro} ${next.title}` : next.title;
}

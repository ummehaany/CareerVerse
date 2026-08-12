import type { InterviewDimensions } from "@/types/interview";

/*
 * Deterministic, offline interview evaluator. Produces per-answer scores, four
 * skill dimensions, an overall score, and actionable feedback — used whenever
 * the AI provider is unavailable. Heuristic but honest: it rewards specificity,
 * structure, ownership, and quantified impact.
 */

export interface LocalEvalItem {
  index: number;
  score: number;
  feedback: string;
}

export interface LocalEvaluation {
  items: LocalEvalItem[];
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  dimensions: InterviewDimensions;
  nextSteps: string[];
}

export interface QAItem {
  question: string;
  focusArea: string;
  answer: string;
}

const STRUCTURE_WORDS = [
  "because", "so that", "as a result", "resulted", "led to", "approach", "solution",
  "first", "then", "finally", "steps", "challenge", "action", "outcome",
];
const OWNERSHIP_WORDS = ["i ", "my ", "we ", "our "];
const TECH_SIGNALS = ["design", "system", "data", "test", "optimi", "implement", "measure", "metric", "trade-off", "architecture"];

function words(s: string): number {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}

function countHits(text: string, list: string[]): number {
  const lower = ` ${text.toLowerCase()} `;
  return list.filter((k) => lower.includes(k)).length;
}

function scoreAnswer(answer: string): number {
  const a = answer.trim();
  if (!a) return 0;
  const w = words(a);
  let s = 1;
  s += Math.min(4, (w / 60) * 4); // length / detail (up to 4)
  if (/\d/.test(a)) s += 1.5; // quantified impact
  s += Math.min(2.5, countHits(a, STRUCTURE_WORDS) * 0.7); // structure
  if (OWNERSHIP_WORDS.some((k) => ` ${a.toLowerCase()} `.includes(k))) s += 1; // ownership
  return Math.max(1, Math.min(10, Math.round(s)));
}

function feedbackFor(answer: string, focus: string, score: number): string {
  if (!answer.trim()) return `No answer given. For a "${focus}" question, structure a concise response with a concrete example.`;
  if (score >= 8) return `Strong, specific answer for "${focus}". Clear structure and detail — keep quantifying your impact.`;
  if (score >= 5) return `Solid answer for "${focus}". Add a specific example and a measurable outcome to make it stronger.`;
  return `This answer is thin for "${focus}". Use the STAR structure (Situation, Task, Action, Result) and add concrete detail.`;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function evaluateLocally(qa: QAItem[]): LocalEvaluation {
  const items: LocalEvalItem[] = qa.map((item, index) => ({
    index,
    score: scoreAnswer(item.answer),
    feedback: feedbackFor(item.answer, item.focusArea, scoreAnswer(item.answer)),
  }));

  const answered = qa.filter((q) => q.answer.trim().length > 0);
  const answerRatio = qa.length ? answered.length / qa.length : 0;
  const avgWords = answered.length ? answered.reduce((s, q) => s + words(q.answer), 0) / answered.length : 0;
  const allText = qa.map((q) => q.answer).join(" ");
  const structureHits = countHits(allText, STRUCTURE_WORDS);
  const techHits = countHits(allText, TECH_SIGNALS);
  const quantified = qa.filter((q) => /\d/.test(q.answer)).length;

  const dimensions: InterviewDimensions = {
    communication: clamp(answerRatio * 45 + Math.min(45, (avgWords / 70) * 45) + 10),
    confidence: clamp(answerRatio * 60 + (OWNERSHIP_WORDS.some((k) => ` ${allText.toLowerCase()} `.includes(k)) ? 25 : 0) + 10),
    technical: clamp(answerRatio * 30 + Math.min(45, techHits * 9) + Math.min(20, quantified * 8) + 5),
    problemSolving: clamp(answerRatio * 30 + Math.min(50, structureHits * 8) + 10),
  };

  const avgItem = items.length ? items.reduce((s, i) => s + i.score, 0) / items.length : 0;
  const dimAvg = (dimensions.communication + dimensions.confidence + dimensions.technical + dimensions.problemSolving) / 4;
  const overallScore = clamp(avgItem * 10 * 0.6 + dimAvg * 0.4);

  const strengths: string[] = [];
  if (dimensions.communication >= 65) strengths.push("Clear, well-articulated communication.");
  if (dimensions.confidence >= 65) strengths.push("Confident, ownership-driven delivery.");
  if (dimensions.technical >= 65) strengths.push("Good technical depth and specifics.");
  if (dimensions.problemSolving >= 65) strengths.push("Structured, logical problem-solving.");
  if (quantified >= 2) strengths.push("Backs up claims with concrete numbers.");
  if (strengths.length === 0) strengths.push("Completed the session — a strong first step to build on.");

  const improvements: string[] = [];
  if (answerRatio < 1) improvements.push("Attempt every question — unanswered ones pull your score down.");
  if (avgWords < 40) improvements.push("Add more detail; aim for 60–120 words per answer.");
  if (structureHits < qa.length) improvements.push("Use the STAR framework to structure behavioral answers.");
  if (quantified < 2) improvements.push("Quantify impact with numbers (%, time saved, users, ₹).");
  if (dimensions.technical < 55) improvements.push("Include more role-specific technical detail and trade-offs.");
  if (improvements.length === 0) improvements.push("Polish delivery and tighten each answer to its strongest point.");

  const summary =
    overallScore >= 75
      ? "Excellent session — your answers were specific, structured, and confident."
      : overallScore >= 55
        ? "Good session. Solid foundation — add more concrete examples and measurable results."
        : overallScore >= 35
          ? "A fair attempt. Focus on structure and detail to level up your answers."
          : "A starting point. Practice structuring answers with real examples and outcomes.";

  const nextSteps = [
    "Rehearse your two weakest answers out loud using the STAR method.",
    quantified < 2 ? "Prepare 3 quantified achievement stories you can reuse." : "Keep a bank of quantified stories ready for any question.",
    dimensions.technical < 60
      ? "Review core concepts and trade-offs for your target role."
      : "Do a timed mock to sharpen delivery under pressure.",
    "Retake this interview in a few days to track your improvement.",
  ];

  return { items, overallScore, summary, strengths, improvements, dimensions, nextSteps };
}

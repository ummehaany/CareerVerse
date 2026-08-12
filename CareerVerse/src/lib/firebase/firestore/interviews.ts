import { cache } from "react";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import {
  INTERVIEW_VERSION,
  type InterviewAnswer,
  type InterviewDifficulty,
  type InterviewDoc,
  type InterviewEvaluation,
  type InterviewQuestion,
  type InterviewType,
} from "@/types/interview";

// Repository for `users/{uid}/interviews`.

function interviewsRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("interviews");
}

export interface SaveInterviewInput {
  role: string;
  type: InterviewType;
  difficulty: InterviewDifficulty;
  provider: string;
  model: string;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  evaluation: InterviewEvaluation;
}

export async function saveInterview(uid: string, input: SaveInterviewInput): Promise<{ id: string }> {
  const ref = interviewsRef(uid).doc();
  await ref.set({
    role: input.role,
    type: input.type,
    difficulty: input.difficulty,
    provider: input.provider,
    model: input.model,
    schemaVersion: INTERVIEW_VERSION,
    questions: input.questions,
    answers: input.answers,
    evaluation: input.evaluation,
    status: "completed",
    createdAt: FieldValue.serverTimestamp(),
  });
  return { id: ref.id };
}

export async function listRecentInterviews(uid: string, max = 5): Promise<InterviewDoc[]> {
  const snap = await interviewsRef(uid).orderBy("createdAt", "desc").limit(max).get();
  return snap.docs.map((doc) => ({ ...(doc.data() as InterviewDoc), id: doc.id }));
}

export interface InterviewStats {
  count: number;
  bestScore: number | null;
}

async function getInterviewStats__impl(uid: string): Promise<InterviewStats> {
  const snap = await interviewsRef(uid).get();
  if (snap.empty) return { count: 0, bestScore: null };
  let best = 0;
  snap.docs.forEach((doc) => {
    const data = doc.data() as InterviewDoc;
    const score = data.evaluation?.overallScore ?? 0;
    if (score > best) best = score;
  });
  return { count: snap.size, bestScore: best };
}

export interface InterviewAnalytics {
  count: number;
  averageScore: number | null;
  bestScore: number | null;
  /** Overall scores oldest → newest, for the trend line. */
  trend: number[];
  strongest: string[];
  weakest: string[];
}

/** Aggregate analytics across a user's interview history. */
export async function getInterviewAnalytics(uid: string): Promise<InterviewAnalytics> {
  const snap = await interviewsRef(uid).orderBy("createdAt", "asc").limit(50).get();
  if (snap.empty) {
    return { count: 0, averageScore: null, bestScore: null, trend: [], strongest: [], weakest: [] };
  }

  const scores: number[] = [];
  const focusTotals = new Map<string, { total: number; count: number }>();

  snap.docs.forEach((doc) => {
    const data = doc.data() as InterviewDoc;
    const evaluation = data.evaluation;
    if (!evaluation) return;
    scores.push(evaluation.overallScore);

    const focusById = new Map((data.questions ?? []).map((q) => [q.id, q.focusArea]));
    for (const item of evaluation.items ?? []) {
      const focus = focusById.get(item.questionId);
      if (!focus) continue;
      const bucket = focusTotals.get(focus) ?? { total: 0, count: 0 };
      bucket.total += item.score;
      bucket.count += 1;
      focusTotals.set(focus, bucket);
    }
  });

  const averageScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const bestScore = scores.length ? Math.max(...scores) : null;

  const ranked = [...focusTotals.entries()]
    .filter(([, v]) => v.count > 0)
    .map(([focus, v]) => ({ focus, avg: v.total / v.count }))
    .sort((a, b) => b.avg - a.avg);

  const strongest = ranked.slice(0, 3).map((r) => r.focus);
  const weakest = ranked.slice(-3).reverse().map((r) => r.focus).filter((f) => !strongest.includes(f));

  return { count: scores.length, averageScore, bestScore, trend: scores, strongest, weakest };
}

/** Request-memoized: dedupes identical per-user reads within a single render (I3). */
export const getInterviewStats = cache(getInterviewStats__impl);

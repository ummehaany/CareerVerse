import { adminDb, FieldValue } from "@/lib/firebase/admin";
import {
  INTERVIEW_VERSION,
  type InterviewAnswer,
  type InterviewDifficulty,
  type InterviewDoc,
  type InterviewEvaluation,
  type InterviewQuestion,
} from "@/types/interview";

// Repository for `users/{uid}/interviews`.

function interviewsRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("interviews");
}

export interface SaveInterviewInput {
  role: string;
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

export async function getInterviewStats(uid: string): Promise<InterviewStats> {
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

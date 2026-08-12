import type { InterviewDifficulty, InterviewQuestion, InterviewType } from "@/types/interview";

/*
 * In-progress interview persistence (client-only, localStorage). Lets a user
 * resume an interrupted session ("Continue Previous Interview") without any
 * backend writes mid-session. Swap for a Firestore draft doc later if desired.
 */

const KEY = "cv:interview-draft";

export interface InterviewDraft {
  role: string;
  type: InterviewType;
  difficulty: InterviewDifficulty;
  perQuestionSeconds: number;
  questions: InterviewQuestion[];
  answers: Record<string, string>;
  index: number;
  savedAt: number;
}

export function loadDraft(): InterviewDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InterviewDraft;
    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(draft: InterviewDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // storage unavailable — resume is a best-effort convenience
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

import type { InterviewDifficulty, InterviewType } from "@/types/interview";

export const INTERVIEW_PROMPT_VERSION = 2;

const LEVEL_LABEL: Record<InterviewDifficulty, string> = {
  junior: "junior / entry-level",
  mid: "mid-level",
  senior: "senior",
};

const TYPE_LABEL: Record<InterviewType, string> = {
  hr: "HR (motivation, fit, background)",
  technical: "technical (role-specific depth and problem solving)",
  behavioral: "behavioral (STAR-style situational)",
  "case-study": "case study (structured problem solving and analysis)",
  "group-discussion": "group discussion (opinion and articulation prompts)",
};

export function buildQuestionsSystemPrompt(): string {
  return [
    "You are an experienced hiring manager and interview coach.",
    "You write realistic, role-specific mock interview questions.",
    "",
    "Rules:",
    "- Generate the requested number of distinct questions for the given role, level, and interview type.",
    "- Match the interview type: HR, technical, behavioral, case study, or group discussion.",
    "- Each question has a short focusArea label (e.g. 'System design', 'Teamwork', 'Fundamentals').",
    "- Keep each question to one or two sentences. No preamble.",
    "- Output ONLY JSON conforming to the schema. No markdown.",
  ].join("\n");
}

export function buildQuestionsUserPrompt(
  role: string,
  difficulty: InterviewDifficulty,
  count: number,
  type: InterviewType,
): string {
  return `Role: ${role}\nLevel: ${LEVEL_LABEL[difficulty]}\nInterview type: ${TYPE_LABEL[type]}\nNumber of questions: ${count}\n\nGenerate the interview questions as JSON.`;
}

export function buildEvaluationSystemPrompt(): string {
  return [
    "You are an experienced interviewer scoring a candidate's mock interview answers.",
    "",
    "Rules:",
    "- Score each answer from 0 to 10 (10 = excellent) with specific, constructive feedback.",
    "- An empty or off-topic answer scores low; reward concrete examples, structure (e.g. STAR), and correctness.",
    "- Provide an overallScore (0–100), a short summary, key strengths, and concrete improvements.",
    "- Provide four dimension scores (0–100): communication, confidence, technical, problemSolving.",
    "- Provide 3–4 concrete nextSteps the candidate should take to improve.",
    "- Be honest but encouraging. Reference what the candidate actually said.",
    "- Each item's `index` MUST match the question index provided.",
    "- Output ONLY JSON conforming to the schema. No markdown.",
  ].join("\n");
}

export function buildEvaluationUserPrompt(
  role: string,
  difficulty: InterviewDifficulty,
  type: InterviewType,
  qa: Array<{ question: string; answer: string; focusArea: string }>,
): string {
  const blocks = qa
    .map(
      (item, index) =>
        `Q${index} [${item.focusArea}]: ${item.question}\nAnswer: ${item.answer.trim() || "(no answer)"}`,
    )
    .join("\n\n");
  return `Role: ${role}\nLevel: ${LEVEL_LABEL[difficulty]}\nInterview type: ${TYPE_LABEL[type]}\n\n${blocks}\n\nScore the answers and return JSON.`;
}

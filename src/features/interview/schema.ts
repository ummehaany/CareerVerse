import { z } from "zod";

const difficulty = z.enum(["junior", "mid", "senior"]);
const interviewType = z.enum(["hr", "technical", "behavioral", "case-study", "group-discussion"]);

export const generateQuestionsSchema = z.object({
  role: z.string().min(1).max(120),
  difficulty,
  type: interviewType.default("technical"),
  count: z.number().int().min(3).max(8),
});

export const submitInterviewSchema = z.object({
  role: z.string().min(1).max(120),
  difficulty,
  type: interviewType.default("technical"),
  questions: z
    .array(
      z.object({
        id: z.string().min(1),
        question: z.string().min(1),
        focusArea: z.string(),
      }),
    )
    .min(1),
  answers: z.array(z.object({ questionId: z.string().min(1), answer: z.string() })).min(1),
});

export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;
export type SubmitInterviewInput = z.infer<typeof submitInterviewSchema>;

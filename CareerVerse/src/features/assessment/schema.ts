import { z } from "zod";

/** An answer is a single value, a list (multi-select), or a number (scale). */
const answerValueSchema = z.union([z.string(), z.array(z.string()), z.number()]);

export const saveProgressSchema = z.object({
  id: z.string().min(1).nullable().optional(),
  // Resume pointer. With one-question-per-screen this is a question index, so
  // the bound is generous enough to cover the full weighted question bank.
  currentStep: z.number().int().min(0).max(200),
  answers: z.record(z.string(), answerValueSchema),
});

/** Completion uses the same wire shape; full validation runs in the action. */
export const completeAssessmentSchema = saveProgressSchema;

export type SaveProgressInput = z.infer<typeof saveProgressSchema>;
export type CompleteAssessmentInput = z.infer<typeof completeAssessmentSchema>;

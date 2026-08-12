import { z } from "zod";

export const generateRoadmapSchema = z.object({
  careerTitle: z.string().min(1).max(200),
});

export const updateMilestoneSchema = z.object({
  roadmapId: z.string().min(1),
  milestoneId: z.string().min(1),
  status: z.enum(["not_started", "in_progress", "completed"]),
});

export type GenerateRoadmapInput = z.infer<typeof generateRoadmapSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

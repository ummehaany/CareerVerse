import type { CoachMessageView } from "@/types/coach";
import type { TokenUsage } from "../types";
import { getAIProvider } from "../index";
import { buildCoachSystemPrompt, buildCoachTranscript } from "../prompts/coach";

export interface CoachReplyResult {
  reply: string;
  provider: string;
  model: string;
  usage: TokenUsage;
}

export async function coachReply(
  context: string,
  history: CoachMessageView[],
  message: string,
): Promise<CoachReplyResult> {
  const provider = getAIProvider();
  const { text, usage } = await provider.generateText({
    system: buildCoachSystemPrompt(context),
    prompt: buildCoachTranscript(history, message),
    temperature: 0.7,
    maxOutputTokens: 900,
  });

  return { reply: text.trim(), provider: provider.name, model: provider.model, usage };
}

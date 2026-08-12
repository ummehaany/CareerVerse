import { getAIProvider } from "@/lib/ai/index";

/**
 * AI Career Summary for the public profile. Produces a concise, third-person,
 * recruiter-facing paragraph. Throws AIError when the provider is unavailable —
 * callers fall back to a deterministic summary.
 */
const SYSTEM = [
  "You are CareerVerse.",
  "Write a concise, third-person, recruiter-facing career summary of a student.",
  "2-4 sentences, ~55 words, confident and specific, no hype, no markdown, no first person.",
].join(" ");

export async function aiProfileSummary(context: string): Promise<string> {
  const provider = getAIProvider();
  const { text } = await provider.generateText({
    system: SYSTEM,
    prompt: `Student data:\n${context}\n\nWrite the summary.`,
    temperature: 0.6,
    maxOutputTokens: 220,
  });
  return text.trim();
}

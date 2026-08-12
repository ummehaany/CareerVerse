import { getAIProvider } from "@/lib/ai/index";

/**
 * AI Memory Insights. Given a student's long-term memory summary, produce a few
 * short, specific, encouraging insights. Throws AIError when the provider is
 * unavailable — callers fall back to deterministic insights.
 */

const SYSTEM = [
  "You are CareerVerse's AI mentor.",
  "Given a student's long-term memory, produce 3-4 short, specific, encouraging insights",
  "about their progress and what to focus on next.",
  "Rules: one insight per line, no numbering, no markdown, each under ~18 words, warm and practical.",
].join(" ");

export async function aiMemoryInsights(memorySummary: string): Promise<string[]> {
  const provider = getAIProvider();
  const { text } = await provider.generateText({
    system: SYSTEM,
    prompt: `Student memory:\n${memorySummary}\n\nGive 3-4 personalized insights.`,
    temperature: 0.6,
    maxOutputTokens: 300,
  });
  return text
    .split(/\n+/)
    .map((l) => l.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

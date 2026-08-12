import { z } from "zod";
import { getAIProvider } from "@/lib/ai/index";

/**
 * The AI Career Mentor voice for Career Discovery. Two calls:
 *  - opening: reads the student's free-text intro, reacts warmly, and extracts
 *    interests + an aspiration line to pre-fill the conversation.
 *  - bridge: acknowledges the last answer and naturally leads into the next
 *    topic (so it feels like chatting, not a form).
 * Both throw AIError when unconfigured; callers fall back to friendly templates.
 */

const MENTOR_SYSTEM = [
  "You are CareerVerse's AI Career Mentor talking with a student during onboarding.",
  "Warm, encouraging, sharp, and genuinely personal — like a great mentor, not a form.",
  "Keep replies to 2-3 short sentences (~40 words). React specifically to what they said,",
  "then naturally lead into the next thing. Never say 'question 1', never sound like a survey.",
  "Occasionally explain briefly why something helps. No markdown, no emoji spam (one is fine).",
].join(" ");

const openingSchema = z.object({
  reply: z.string().min(1),
  interests: z.array(z.string()).default([]),
  aspiration: z.string().default(""),
});

export interface OpeningResult {
  reply: string;
  interests: string[];
  aspiration: string;
}

export async function aiOpeningReply(
  aboutText: string,
  allowedInterests: { value: string; label: string }[],
): Promise<OpeningResult> {
  const provider = getAIProvider();
  const list = allowedInterests.map((i) => `${i.value} (${i.label})`).join(", ");
  const { data } = await provider.generateObject(openingSchema, {
    system: MENTOR_SYSTEM,
    prompt: [
      `The student just introduced themselves:\n"""${aboutText.slice(0, 1200)}"""`,
      "",
      "Write a warm 2-3 sentence reply that reacts specifically to what they shared, then says you'd love to see what excites them most (they'll pick from cards next).",
      `Also extract the interests they implied, ONLY as values from this list: ${list}.`,
      "Return up to 6 matching interest values (empty if none are clear), and a one-line paraphrase of their aspiration if present.",
    ].join("\n"),
    temperature: 0.7,
    maxOutputTokens: 400,
    responseSchema: {
      type: "OBJECT",
      properties: {
        reply: { type: "STRING" },
        interests: { type: "ARRAY", items: { type: "STRING" } },
        aspiration: { type: "STRING" },
      },
      required: ["reply", "interests", "aspiration"],
    },
  });
  const allowed = new Set(allowedInterests.map((i) => i.value));
  return {
    reply: data.reply.trim(),
    interests: (data.interests ?? []).filter((v) => allowed.has(v)).slice(0, 6),
    aspiration: (data.aspiration ?? "").trim(),
  };
}

export async function aiBridgeReply(input: {
  lastAnswer: string;
  nextPrompt: string;
  isCards: boolean;
}): Promise<string> {
  const provider = getAIProvider();
  const { text } = await provider.generateText({
    system: MENTOR_SYSTEM,
    prompt: [
      input.lastAnswer ? `The student just answered: "${input.lastAnswer.slice(0, 300)}".` : "",
      `Acknowledge it briefly and warmly, then naturally ask: "${input.nextPrompt}".`,
      input.isCards ? "They'll choose from selectable cards, so invite them to pick." : "",
      "2-3 short sentences. End on the question.",
    ]
      .filter(Boolean)
      .join("\n"),
    temperature: 0.7,
    maxOutputTokens: 160,
  });
  return text.trim();
}

"use server";

import { verifySession } from "@/lib/firebase/auth";
import { enforceRateLimit } from "@/lib/firebase/firestore/rate-limit";
import { isAIConfigured } from "@/lib/ai/index";
import { aiBridgeReply, aiOpeningReply } from "@/lib/ai/services/discovery-mentor";
import { interestOptionValues } from "./engine";

/**
 * Conversational turns for Career Discovery. Each returns a mentor "reply" plus
 * (for the opener) interests parsed from the free text. Always succeeds: if the
 * AI provider is unavailable or errors, a warm templated reply is returned so
 * the conversation never stalls.
 */

export interface OpeningResponse {
  reply: string;
  interests: string[];
  aspiration: string;
  source: "ai" | "offline";
}

export async function discoveryOpening(aboutText: string): Promise<OpeningResponse> {
  const fallback: OpeningResponse = {
    reply: "Thanks for sharing that — it gives me a great sense of you already. Let's build on it: what excites you the most? Pick a few that feel right.",
    interests: [],
    aspiration: aboutText.trim().slice(0, 240),
    source: "offline",
  };
  try {
    const decoded = await verifySession();
    if (!decoded) return fallback;
    if (!aboutText.trim() || !isAIConfigured()) return fallback;
    const _rl = await enforceRateLimit(decoded.uid, "discovery-turn", 30);
    if (!_rl.ok) return fallback;
    const res = await aiOpeningReply(aboutText, interestOptionValues());
    return { ...res, source: "ai" };
  } catch {
    return fallback;
  }
}

export interface BridgeResponse {
  reply: string;
  source: "ai" | "offline";
}

export async function discoveryBridge(input: {
  lastAnswer: string;
  nextPrompt: string;
  isCards: boolean;
  fallback: string;
}): Promise<BridgeResponse> {
  try {
    const decoded = await verifySession();
    if (!decoded || !isAIConfigured()) return { reply: input.fallback, source: "offline" };
    const _rl = await enforceRateLimit(decoded.uid, "discovery-turn", 30);
    if (!_rl.ok) return { reply: input.fallback, source: "offline" };
    const reply = await aiBridgeReply({ lastAnswer: input.lastAnswer, nextPrompt: input.nextPrompt, isCards: input.isCards });
    return { reply: reply || input.fallback, source: "ai" };
  } catch {
    return { reply: input.fallback, source: "offline" };
  }
}

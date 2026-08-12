import { serverEnv } from "@/lib/env.server";
import type { AIProvider } from "./types";
import { createGeminiProvider } from "./providers/gemini";

/*
 * Provider factory. Reads AI_PROVIDER from the validated server env (default
 * `gemini`) and returns the configured adapter. The instance is memoized per
 * server process. Construction throws AIError("not_configured") when the
 * provider's key is missing — callers map that to a friendly message.
 */
let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;

  switch (serverEnv.AI_PROVIDER) {
    case "gemini":
    default:
      cached = createGeminiProvider();
      return cached;
  }
}

/** Cheap check (no network) used by UI to decide whether to offer generation. */
export function isAIConfigured(): boolean {
  return Boolean(serverEnv.GEMINI_API_KEY);
}

import type { ZodType } from "zod";
import { serverEnv } from "@/lib/env.server";
import {
  AIError,
  type AIProvider,
  type GenerateObjectOptions,
  type GenerateTextOptions,
  type ObjectResult,
  type TextResult,
  type TokenUsage,
} from "../types";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Current, broadly-available Gemini Developer API models tried in order when the
 * configured model is unavailable (e.g. an older model has been retired). The
 * configured GEMINI_MODEL is always tried first.
 */
const FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest"];

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  promptFeedback?: { blockReason?: string };
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }
  return trimmed;
}

function shorten(detail: string): string {
  const collapsed = detail.replace(/\s+/g, " ").trim();
  return collapsed.length > 400 ? `${collapsed.slice(0, 400)}…` : collapsed;
}

/**
 * Google Gemini adapter — the default provider. Implemented against the REST
 * API with the runtime's built-in fetch so we add no dependency; the adapter is
 * the only place that knows Gemini's wire format.
 */
export function createGeminiProvider(): AIProvider {
  const apiKey = serverEnv.GEMINI_API_KEY;
  const configuredModel = serverEnv.GEMINI_MODEL;

  if (!apiKey) {
    throw new AIError(
      "AI is not configured. Set GEMINI_API_KEY in your environment to enable AI features.",
      "not_configured",
    );
  }

  const candidateModels = Array.from(
    new Set([configuredModel, ...FALLBACK_MODELS].filter(Boolean)),
  );

  function buildBody(options: GenerateObjectOptions, asJson: boolean): Record<string, unknown> {
    const generationConfig: Record<string, unknown> = {
      temperature: options.temperature ?? 0.6,
      maxOutputTokens: options.maxOutputTokens ?? 4096,
    };
    if (asJson) {
      generationConfig.responseMimeType = "application/json";
      if (options.responseSchema) generationConfig.responseSchema = options.responseSchema;
    }

    const body: Record<string, unknown> = {
      contents: [{ role: "user", parts: [{ text: options.prompt }] }],
      generationConfig,
    };
    if (options.system) {
      body.systemInstruction = { parts: [{ text: options.system }] };
    }
    return body;
  }

  function parseSuccess(json: GeminiResponse): { text: string; usage: TokenUsage } {
    if (json.promptFeedback?.blockReason) {
      throw new AIError(
        "The request was blocked by the AI provider.",
        "provider_error",
        json.promptFeedback.blockReason,
      );
    }

    const parts = json.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((part) => part.text ?? "").join("");
    if (!text.trim()) {
      throw new AIError(
        "The AI returned an empty response.",
        "empty_response",
        json.candidates?.[0]?.finishReason,
      );
    }

    const meta = json.usageMetadata ?? {};
    return {
      text,
      usage: {
        inputTokens: meta.promptTokenCount ?? 0,
        outputTokens: meta.candidatesTokenCount ?? 0,
        totalTokens: meta.totalTokenCount ?? 0,
      },
    };
  }

  async function call(body: Record<string, unknown>): Promise<{ text: string; usage: TokenUsage }> {
    let lastStatus = 0;
    let lastDetail = "";

    for (const model of candidateModels) {
      let response: Response;
      try {
        response = await fetch(`${ENDPOINT}/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch (error) {
        throw new AIError(
          "Could not reach the AI provider.",
          "provider_error",
          error instanceof Error ? error.message : undefined,
        );
      }

      if (response.ok) {
        return parseSuccess((await response.json()) as GeminiResponse);
      }

      lastStatus = response.status;
      lastDetail = await response.text().catch(() => "");

      // 404 = model not found / unsupported for generateContent → try the next.
      if (response.status === 404) {
        console.error(
          `[ai] Gemini model "${model}" is unavailable (404); trying a fallback model. Detail: ${shorten(lastDetail)}`,
        );
        continue;
      }

      // Any other error (400/401/403/429/5xx) is not model-specific — surface it.
      console.error(`[ai] Gemini request failed (${response.status}): ${shorten(lastDetail)}`);
      throw new AIError(
        `Gemini request failed (${response.status}): ${shorten(lastDetail)}`,
        "provider_error",
        lastDetail,
      );
    }

    console.error(
      `[ai] No available Gemini model among [${candidateModels.join(", ")}]. Last status ${lastStatus}: ${shorten(lastDetail)}`,
    );
    throw new AIError(
      `No available Gemini model (last status ${lastStatus}). ${shorten(lastDetail)}`,
      "provider_error",
      lastDetail,
    );
  }

  return {
    name: "gemini",
    model: configuredModel,
    capabilities: { streaming: false, embeddings: false, structuredOutput: true },

    async generateText(options: GenerateTextOptions): Promise<TextResult> {
      const { text, usage } = await call(buildBody(options, false));
      return { text, usage };
    },

    async generateObject<T>(
      schema: ZodType<T>,
      options: GenerateObjectOptions,
    ): Promise<ObjectResult<T>> {
      const { text, usage } = await call(buildBody(options, true));

      let parsed: unknown;
      try {
        parsed = JSON.parse(stripCodeFences(text));
      } catch {
        throw new AIError("The AI returned invalid JSON.", "invalid_json");
      }

      const result = schema.safeParse(parsed);
      if (!result.success) {
        throw new AIError(
          "The AI response did not match the expected format.",
          "schema_mismatch",
          result.error.message,
        );
      }

      return { data: result.data, usage };
    },
  };
}

import type { ZodType } from "zod";

/*
 * Provider-agnostic AI contract (architecture §12). Feature code depends only
 * on this interface and the domain services built on top of it — never on a
 * specific model SDK. Swapping providers is a config change, not a refactor.
 */

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface GenerateTextOptions {
  system?: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GenerateObjectOptions extends GenerateTextOptions {
  /** Provider-native JSON schema hint. Output is always Zod-validated regardless. */
  responseSchema?: Record<string, unknown>;
}

export interface TextResult {
  text: string;
  usage: TokenUsage;
}

export interface ObjectResult<T> {
  data: T;
  usage: TokenUsage;
}

export interface AIProviderCapabilities {
  streaming: boolean;
  embeddings: boolean;
  structuredOutput: boolean;
}

export interface AIProvider {
  readonly name: string;
  readonly model: string;
  readonly capabilities: AIProviderCapabilities;
  generateText(options: GenerateTextOptions): Promise<TextResult>;
  /** Generate a value validated against `schema`. Throws AIError on mismatch. */
  generateObject<T>(schema: ZodType<T>, options: GenerateObjectOptions): Promise<ObjectResult<T>>;
}

export type AIErrorCode =
  | "not_configured"
  | "provider_error"
  | "empty_response"
  | "invalid_json"
  | "schema_mismatch"
  | "insufficient_input"
  | "unknown";

/** Normalized error surface so callers can map codes to friendly messages. */
export class AIError extends Error {
  readonly code: AIErrorCode;
  readonly detail?: string;

  constructor(message: string, code: AIErrorCode = "unknown", detail?: string) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.detail = detail;
  }
}

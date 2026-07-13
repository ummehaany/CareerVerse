import { z } from "zod";

/**
 * Server-only environment. These are secrets (Firebase Admin service account
 * credentials, AI provider keys) and must never be imported into client
 * components. AI variables are optional so the app boots without them; AI
 * features degrade gracefully and report that configuration is required.
 */
const schema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  AI_PROVIDER: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
});

const parsed = schema.safeParse({
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  AI_PROVIDER: process.env.AI_PROVIDER,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
});

if (!parsed.success) {
  throw new Error(
    "Invalid or missing Firebase Admin environment variables. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local.",
  );
}

export const serverEnv = {
  FIREBASE_PROJECT_ID: parsed.data.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: parsed.data.FIREBASE_CLIENT_EMAIL,
  // Dashboards often store the key with literal "\n" sequences; normalize them.
  FIREBASE_PRIVATE_KEY: parsed.data.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  // AI layer (provider-agnostic; Gemini is the default). The default model is a
  // current Gemini Developer API model; the adapter also falls back across
  // current models if the configured one has been retired.
  AI_PROVIDER: parsed.data.AI_PROVIDER ?? "gemini",
  GEMINI_API_KEY: parsed.data.GEMINI_API_KEY ?? "",
  GEMINI_MODEL: parsed.data.GEMINI_MODEL ?? "gemini-2.0-flash",
} as const;

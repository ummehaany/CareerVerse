import { z } from "zod";

/**
 * Server-only environment. These are secrets (Firebase Admin service account
 * credentials, AI provider keys, email provider keys) and must never be
 * imported into client components. Optional variables let the app boot without
 * them; the corresponding features degrade gracefully and report that
 * configuration is required.
 */
const schema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  AI_PROVIDER: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  // Email (provider-agnostic; "log" no-op default). Optional so the app runs
  // with zero email configuration — nothing is sent until a provider is set.
  EMAIL_PROVIDER: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  // Shared secret protecting the scheduled weekly-report cron endpoint.
  CRON_SECRET: z.string().optional(),
  // Learning Hub storage layer selector ("json" default | "firestore").
  LEARNING_RESOURCE_PROVIDER: z.string().optional(),
});

const parsed = schema.safeParse({
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  AI_PROVIDER: process.env.AI_PROVIDER,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  CRON_SECRET: process.env.CRON_SECRET,
  LEARNING_RESOURCE_PROVIDER: process.env.LEARNING_RESOURCE_PROVIDER,
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
  // Email layer (provider-agnostic; "log" no-op default writes intent to the
  // server log instead of sending). Set EMAIL_PROVIDER=resend + RESEND_API_KEY
  // + EMAIL_FROM to deliver real mail.
  EMAIL_PROVIDER: parsed.data.EMAIL_PROVIDER ?? "log",
  RESEND_API_KEY: parsed.data.RESEND_API_KEY ?? "",
  EMAIL_FROM: parsed.data.EMAIL_FROM ?? "CareerVerse AI <onboarding@resend.dev>",
  CRON_SECRET: parsed.data.CRON_SECRET ?? "",
  // Learning resources come from bundled JSON by default; set to "firestore"
  // (and seed the collection) to serve them from Firestore with zero UI change.
  LEARNING_RESOURCE_PROVIDER: parsed.data.LEARNING_RESOURCE_PROVIDER ?? "json",
} as const;

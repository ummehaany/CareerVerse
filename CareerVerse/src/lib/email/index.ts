import { serverEnv } from "@/lib/env.server";
import { LogEmailProvider } from "@/lib/email/providers/log";
import { ResendEmailProvider } from "@/lib/email/providers/resend";
import type { EmailProvider } from "@/lib/email/types";

/**
 * Email provider factory — mirrors src/lib/ai. Resolves once per process.
 * Selects a real provider only when fully configured; otherwise the no-op Log
 * provider, so the app runs (and never crashes a user flow) with zero email
 * configuration. This makes email a graceful, opt-in capability.
 */
let cached: EmailProvider | null = null;

/** True only when a real transactional provider is wired up. */
export function isEmailConfigured(): boolean {
  return (
    serverEnv.EMAIL_PROVIDER === "resend" &&
    Boolean(serverEnv.RESEND_API_KEY) &&
    Boolean(serverEnv.EMAIL_FROM)
  );
}

export function getEmailProvider(): EmailProvider {
  if (cached) return cached;
  cached = isEmailConfigured()
    ? new ResendEmailProvider(serverEnv.RESEND_API_KEY, serverEnv.EMAIL_FROM)
    : new LogEmailProvider();
  return cached;
}

export * from "@/lib/email/types";

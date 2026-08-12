import { siteConfig } from "@/config/site";
import { ROUTES } from "@/config/routes";
import { getUser } from "@/lib/firebase/firestore/users";
import { reserveSend } from "@/lib/firebase/firestore/email-log";
import { getEmailProvider } from "@/lib/email";
import { normalizeEmailPreferences, type EmailCategory, type EmailContent } from "@/lib/email/types";
import type { EmailLinks } from "@/lib/email/templates";
import type { User } from "@/types";

/**
 * Central email dispatcher. Every trigger goes through `sendCategoryEmail`,
 * which enforces the three gates in order — user preference, then anti-spam
 * reservation — before building and delivering the email. It is fire-and-forget
 * safe: it never throws, so a failed email can never break a user flow.
 */

export type EmailDispatchStatus =
  | "sent"
  | "logged"
  | "failed"
  | "no-recipient"
  | "disabled"
  | "throttled"
  | "error";

export interface EmailBuildContext {
  user: User;
  links: EmailLinks;
}

/** Absolute app links used by every template. */
export function emailLinks(): EmailLinks {
  const appUrl = siteConfig.url.replace(/\/$/, "");
  return { appUrl, preferencesUrl: `${appUrl}${ROUTES.settings}` };
}

interface SendOptions {
  /** One-time dedupe key (e.g. `ach:interview-ace`, `resume:80`). */
  dedupeKey?: string;
}

/**
 * Preference- and spam-aware send. `build` is only invoked once the send has
 * been authorized, so we never waste work on suppressed emails.
 */
export async function sendCategoryEmail(
  uid: string,
  category: EmailCategory,
  build: (ctx: EmailBuildContext) => EmailContent,
  opts: SendOptions = {},
): Promise<EmailDispatchStatus> {
  try {
    const user = await getUser(uid);
    if (!user?.email) return "no-recipient";

    const prefs = normalizeEmailPreferences(user.emailPreferences);
    if (!prefs[category]) return "disabled";

    const allowed = await reserveSend(uid, category, { dedupeKey: opts.dedupeKey });
    if (!allowed) return "throttled";

    const content = build({ user, links: emailLinks() });
    const provider = getEmailProvider();
    const outcome = await provider.send({ to: user.email, ...content });

    if (!outcome.ok) return "failed";
    return provider.name === "log" ? "logged" : "sent";
  } catch (error) {
    // Never surface email failures into a user flow.
    console.error(`[email] dispatch "${category}" failed:`, error instanceof Error ? error.message : error);
    return "error";
  }
}

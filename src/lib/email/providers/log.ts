import type { EmailMessage, EmailProvider, EmailSendOutcome } from "@/lib/email/types";

/**
 * Safe default provider. Delivers nothing; logs intent so local and
 * unconfigured environments behave predictably and never fail a user flow.
 * Selected automatically whenever no real provider is configured.
 */
export class LogEmailProvider implements EmailProvider {
  readonly name = "log";

  async send(message: EmailMessage): Promise<EmailSendOutcome> {
    console.info(`[email:log] would send "${message.subject}" -> ${message.to}`);
    return { ok: true, id: "log" };
  }
}

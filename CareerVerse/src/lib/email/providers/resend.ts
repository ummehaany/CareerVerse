import type { EmailMessage, EmailProvider, EmailSendOutcome } from "@/lib/email/types";

/**
 * Resend provider using the REST API via fetch — no SDK dependency is added,
 * consistent with how the AI layer talks to its provider. The factory only
 * selects this when RESEND_API_KEY and EMAIL_FROM are configured.
 */
export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(message: EmailMessage): Promise<EmailSendOutcome> {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: message.to,
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error(`[email:resend] send failed (${res.status}): ${detail}`);
        return { ok: false, error: `resend_${res.status}` };
      }

      const data = (await res.json().catch(() => ({}))) as { id?: string };
      return { ok: true, id: data.id };
    } catch (error) {
      console.error("[email:resend] network error:", error instanceof Error ? error.message : error);
      return { ok: false, error: "network" };
    }
  }
}

/**
 * Premium email design system.
 *
 * One responsive, dark-mode-aware shell (`wrapEmail`) plus a set of reusable,
 * composable content blocks. Layout is table-based with inline styles for
 * maximum email-client compatibility; CSS classes drive the
 * `prefers-color-scheme` (dark mode) and mobile media queries. Every template
 * is assembled from these blocks, so branding and spacing stay consistent and
 * new emails are cheap to build.
 *
 * Colors mirror the app's design tokens (globals.css): primary #2a78d6, with
 * per-feature accents used to give each email a subtle category identity.
 */

export const EMAIL_BRAND = {
  name: "CareerVerse AI",
  tagline: "Experience your future before choosing it.",
  primary: "#2a78d6",
  magenta: "#c6467c",
  ink: "#1a2230",
  muted: "#5b6472",
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  soft: "#f4f7fb",
  border: "#e6ebf2",
} as const;

/** Per-feature accents (hex mirrors of the --accent-* tokens). */
export const EMAIL_ACCENTS = {
  assessment: "#2a78d6",
  roadmap: "#12986a",
  resume: "#5a49c4",
  interview: "#d9561f",
  mentor: "#c6467c",
} as const;

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** Minimal HTML escaping for interpolated dynamic text. */
export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function accentOr(accent?: string): string {
  return accent ?? EMAIL_BRAND.primary;
}

/* ── Cell-level blocks (place inside emailSection) ──────────────────────────*/

/** A body paragraph. `html` may contain safe inline markup; escape values. */
export function emailParagraph(html: string, opts?: { center?: boolean; muted?: boolean }): string {
  const color = opts?.muted === false ? EMAIL_BRAND.ink : EMAIL_BRAND.muted;
  const cls = opts?.muted === false ? "cv-ink" : "cv-muted";
  return `<p class="${cls}" style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.65;color:${color};${
    opts?.center ? "text-align:center;" : ""
  }">${html}</p>`;
}

/** A secondary heading within the body. */
export function emailHeading(text: string): string {
  return `<h2 class="cv-ink" style="margin:0 0 12px;font-family:${FONT};font-size:18px;line-height:1.3;font-weight:800;color:${EMAIL_BRAND.ink};">${esc(
    text,
  )}</h2>`;
}

/** A primary call-to-action button. */
export function emailButton(label: string, href: string, accent?: string): string {
  const color = accentOr(accent);
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 8px;">
    <tr><td style="border-radius:10px;background:${color};">
      <a href="${esc(href)}" target="_blank"
         style="display:inline-block;padding:14px 30px;font-family:${FONT};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">${esc(
    label,
  )}</a>
    </td></tr>
  </table>`;
}

/** A labelled progress bar. */
export function emailProgress(label: string, percent: number, accent?: string): string {
  const color = accentOr(accent);
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
    <tr>
      <td class="cv-muted" style="font-family:${FONT};font-size:13px;font-weight:600;color:${EMAIL_BRAND.muted};padding-bottom:6px;">${esc(
    label,
  )}</td>
      <td align="right" style="font-family:${FONT};font-size:13px;font-weight:800;color:${color};padding-bottom:6px;">${pct}%</td>
    </tr>
    <tr><td colspan="2" style="padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="cv-soft" style="background:${EMAIL_BRAND.soft};border-radius:999px;">
        <tr><td style="padding:0;font-size:0;line-height:0;">
          <table role="presentation" width="${pct}%" cellpadding="0" cellspacing="0"><tr><td style="height:8px;border-radius:999px;background:${color};font-size:0;line-height:0;">&nbsp;</td></tr></table>
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}

/** A responsive grid of stat tiles (2 per row, stacks on mobile). */
export function emailStatCards(
  stats: Array<{ label: string; value: string; accent?: string }>,
): string {
  const cells = stats.map((s) => {
    const color = accentOr(s.accent);
    return `<td class="cv-stat cv-soft cv-border" width="48%" style="width:48%;background:${EMAIL_BRAND.soft};border:1px solid ${EMAIL_BRAND.border};border-radius:12px;padding:16px 18px;vertical-align:top;">
        <div style="font-family:${FONT};font-size:23px;font-weight:800;color:${color};line-height:1.1;">${esc(
      s.value,
    )}</div>
        <div class="cv-muted" style="font-family:${FONT};font-size:11px;font-weight:700;color:${EMAIL_BRAND.muted};margin-top:5px;text-transform:uppercase;letter-spacing:.5px;">${esc(
      s.label,
    )}</div>
      </td>`;
  });

  const rows: string[] = [];
  for (let i = 0; i < cells.length; i += 2) {
    const left = cells[i];
    const right = cells[i + 1] ?? `<td width="48%" style="width:48%;">&nbsp;</td>`;
    rows.push(
      `<tr>${left}<td width="4%" style="width:4%;font-size:0;line-height:0;">&nbsp;</td>${right}</tr>`,
    );
  }
  const joined = rows.join(
    `<tr><td colspan="3" style="height:12px;font-size:0;line-height:0;">&nbsp;</td></tr>`,
  );
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">${joined}</table>`;
}

/** A prominent achievement/badge card. */
export function emailAchievementCard(opts: {
  emoji: string;
  title: string;
  description: string;
  accent?: string;
}): string {
  const color = accentOr(opts.accent);
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="cv-soft cv-border" style="background:${EMAIL_BRAND.soft};border:1px solid ${EMAIL_BRAND.border};border-radius:14px;margin:0 0 14px;">
    <tr>
      <td width="70" style="width:70px;padding:16px 0 16px 16px;vertical-align:middle;">
        <div class="cv-card cv-border" style="width:48px;height:48px;line-height:48px;text-align:center;border-radius:12px;background:${EMAIL_BRAND.cardBg};border:1px solid ${EMAIL_BRAND.border};font-size:24px;">${opts.emoji}</div>
      </td>
      <td style="padding:16px 14px 16px 12px;vertical-align:middle;">
        <div class="cv-ink" style="font-family:${FONT};font-size:15px;font-weight:800;color:${EMAIL_BRAND.ink};">${esc(
    opts.title,
  )}</div>
        <div class="cv-muted" style="font-family:${FONT};font-size:13px;line-height:1.5;color:${EMAIL_BRAND.muted};margin-top:2px;">${esc(
    opts.description,
  )}</div>
      </td>
      <td width="8" style="width:8px;background:${color};font-size:0;line-height:0;">&nbsp;</td>
    </tr>
  </table>`;
}

/** A highlighted callout box (e.g. a strength, a recommendation). */
export function emailCallout(opts: {
  emoji?: string;
  title: string;
  body: string;
  accent?: string;
}): string {
  const color = accentOr(opts.accent);
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="cv-soft" style="background:${EMAIL_BRAND.soft};border-left:4px solid ${color};border-radius:10px;margin:0 0 16px;">
    <tr><td style="padding:14px 16px;">
      <div class="cv-ink" style="font-family:${FONT};font-size:13px;font-weight:800;color:${EMAIL_BRAND.ink};">${
        opts.emoji ? opts.emoji + " " : ""
      }${esc(opts.title)}</div>
      <div class="cv-muted" style="font-family:${FONT};font-size:14px;line-height:1.6;color:${EMAIL_BRAND.muted};margin-top:4px;">${
        opts.body
      }</div>
    </td></tr>
  </table>`;
}

/** A simple accented bullet list. `items` may contain safe inline markup. */
export function emailBullets(items: string[], accent?: string): string {
  const color = accentOr(accent);
  const lis = items
    .map(
      (it) => `
    <tr>
      <td width="22" valign="top" style="width:22px;font-family:${FONT};font-size:16px;color:${color};line-height:1.5;">&bull;</td>
      <td class="cv-muted" style="font-family:${FONT};font-size:14px;line-height:1.6;color:${EMAIL_BRAND.muted};padding-bottom:7px;">${it}</td>
    </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">${lis}</table>`;
}

/** A thin horizontal rule. */
export function emailDivider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 18px;"><tr><td class="cv-border" style="border-top:1px solid ${EMAIL_BRAND.border};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr></table>`;
}

/* ── Section + hero (full rows) ─────────────────────────────────────────────*/

/** Wrap cell-level blocks in a padded content row. */
export function emailSection(inner: string, opts?: { paddingTop?: number }): string {
  const pt = opts?.paddingTop ?? 20;
  return `<tr><td class="cv-pad" style="padding:${pt}px 40px 0;">${inner}</td></tr>`;
}

/** The hero row: an emoji medallion, a title and a subtitle. */
export function emailHero(opts: {
  emoji: string;
  title: string;
  subtitle: string;
  accent?: string;
}): string {
  const color = accentOr(opts.accent);
  return `
  <tr><td class="cv-pad" style="padding:14px 40px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 18px;"><tr><td class="cv-soft" style="width:76px;height:76px;border-radius:50%;background:${EMAIL_BRAND.soft};text-align:center;font-size:36px;line-height:76px;border-bottom:3px solid ${color};">${opts.emoji}</td></tr></table>
      <h1 class="cv-ink" style="margin:0 0 10px;font-family:${FONT};font-size:24px;line-height:1.25;font-weight:800;color:${EMAIL_BRAND.ink};">${esc(
    opts.title,
  )}</h1>
      <p class="cv-muted" style="margin:0;font-family:${FONT};font-size:15px;line-height:1.6;color:${EMAIL_BRAND.muted};">${esc(
    opts.subtitle,
  )}</p>
    </td></tr></table>
  </td></tr>`;
}

/* ── Shell ──────────────────────────────────────────────────────────────────*/

/**
 * Wrap composed content rows in the full responsive, dark-mode-aware document.
 * `content` must be a sequence of <tr>…</tr> rows (use emailHero/emailSection).
 */
export function wrapEmail(opts: {
  preheader: string;
  accent?: string;
  content: string;
  preferencesUrl?: string;
  showPreferences?: boolean;
}): string {
  const color = accentOr(opts.accent);
  const prefsUrl = opts.preferencesUrl ?? "#";
  const year = new Date().getFullYear();
  const prefsRow =
    opts.showPreferences === false
      ? ""
      : `<p class="cv-footer" style="margin:0 0 6px;font-family:${FONT};font-size:12px;line-height:1.6;color:#8a94a6;">You're receiving this because you have a CareerVerse account. <a href="${esc(
          prefsUrl,
        )}" style="color:${color};text-decoration:underline;">Manage email preferences</a>.</p>`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(EMAIL_BRAND.name)}</title>
<style>
  body{margin:0;padding:0;background:${EMAIL_BRAND.pageBg};-webkit-text-size-adjust:100%;}
  img{border:0;line-height:100%;outline:none;text-decoration:none;}
  table{border-collapse:collapse;}
  @media only screen and (max-width:600px){
    .cv-container{width:100% !important;}
    .cv-pad{padding-left:22px !important;padding-right:22px !important;}
    .cv-stat{display:block !important;width:100% !important;box-sizing:border-box !important;margin-bottom:10px;}
  }
  @media (prefers-color-scheme: dark){
    body,.cv-body{background:#0c1016 !important;}
    .cv-card{background:#151b25 !important;}
    .cv-ink{color:#f1f4f8 !important;}
    .cv-muted{color:#a7b1c2 !important;}
    .cv-soft{background:#1c2431 !important;}
    .cv-border{border-color:#28313f !important;}
    .cv-footer{color:#8a94a6 !important;}
    .cv-wordmark{color:#f1f4f8 !important;}
  }
</style>
</head>
<body class="cv-body" style="margin:0;padding:0;background:${EMAIL_BRAND.pageBg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(
    opts.preheader,
  )}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_BRAND.pageBg};">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" class="cv-container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
        <tr><td style="height:6px;border-radius:16px 16px 0 0;background:${color};background:linear-gradient(90deg,${color},${EMAIL_BRAND.magenta});font-size:0;line-height:6px;">&nbsp;</td></tr>
        <tr><td class="cv-card cv-border" style="background:${EMAIL_BRAND.cardBg};border:1px solid ${EMAIL_BRAND.border};border-top:0;border-radius:0 0 16px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td class="cv-pad" style="padding:26px 40px 4px;">
              <span class="cv-wordmark" style="font-family:${FONT};font-size:17px;font-weight:800;letter-spacing:-0.2px;color:${EMAIL_BRAND.ink};">CareerVerse<span style="color:${color};"> AI</span></span>
            </td></tr>
            ${opts.content}
            <tr><td class="cv-pad cv-border" style="padding:26px 40px 30px;border-top:1px solid ${EMAIL_BRAND.border};margin-top:10px;">
              ${prefsRow}
              <p class="cv-footer" style="margin:0;font-family:${FONT};font-size:12px;line-height:1.6;color:#8a94a6;">&copy; ${year} ${esc(
    EMAIL_BRAND.name,
  )} &middot; ${esc(EMAIL_BRAND.tagline)}</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

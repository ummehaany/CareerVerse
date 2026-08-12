# CareerVerse — Final Pre-Deployment Audit
**Read-only technical review · August 12, 2026 · Scope: is the current build safe and stable enough to deploy right now?**

No code was modified during this audit. This audit is technical/deployment-safety focused and is separate from the product/UX audit dated August 11, 2026 (`CareerVerse_Product_Audit_2026-08-11.md`), which is reviewed in Section 6 below.

---

## 1. Production checks — results

| Check | Result |
|---|---|
| `tsc --noEmit` (typecheck) | **Clean.** Zero errors. |
| `next lint` | **Clean.** Zero warnings/errors. |
| `next build` (production build) | **Not completed in this sandbox.** The root layout uses `next/font/google` (Geist, Geist Mono), which fetches font files from `fonts.googleapis.com` / `fonts.gstatic.com` at build time. This sandbox's network proxy blocks both domains (confirmed with `curl` → `403` from proxy), so the build hangs indefinitely at the compile step and never completes. This is a sandbox network-egress limitation, not a code defect — it will not occur on a normal host with open internet access (Vercel, Netlify, your own CI). **Action: run `npm run build` once in your real deploy environment before or immediately after shipping**, as the final confirmation step this audit could not perform. This is the single open item preventing full confidence below. |
| Automated tests | **None exist.** No Jest/Vitest/Playwright/Cypress config and no `*.test.*`/`*.spec.*` files in the repo. Not a blocker by itself, but means typecheck/lint are the only automated safety nets right now. |
| Dependency/config sanity | `package.json` scripts (`dev`/`build`/`start`/`lint`/`typecheck`) all standard and correct for Next.js 15 App Router. No hardcoded secrets found in `src/` (pattern search for API-key-shaped strings and PEM private keys came back clean). `.env*` is git-ignored. |

---

## 2. Auth, environment, and security configuration

**Authentication.** Firebase Auth on the client, verified server-side. `/api/auth/session` verifies the ID token with the Admin SDK, bootstraps the user's Firestore documents idempotently, then sets an `httpOnly`, `sameSite=lax` session cookie that is also `secure` whenever `NODE_ENV=production`. Edge middleware only does a fast cookie-presence check to redirect unauthenticated users away from protected routes (and authenticated users away from `/login`/`/signup`) — actual token verification happens server-side via the Admin SDK, which is correct since the Admin SDK cannot run on the edge. All 20+ authenticated routes are covered by the middleware matcher; no protected route was found missing from it.

**Environment variables.** Both client and server env are validated through `zod` schemas (`src/lib/env.ts`, `src/lib/env.server.ts`) that throw a clear error at boot if a required variable is missing, rather than failing silently later. Required variables (`NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_PROJECT_ID`/`FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY`) are present in `.env.local`. `EMAIL_PROVIDER`, `RESEND_API_KEY`, `EMAIL_FROM`, and `CRON_SECRET` are unset — these are all explicitly optional and degrade gracefully (email falls back to a log-only no-op provider; the cron endpoint returns 404/disabled when `CRON_SECRET` is unset), so their absence does not break anything, it just means those specific features are inactive.

**Client/server separation.** Firebase Admin credentials, the Gemini API key, and the Resend key are only ever read from `serverEnv` inside server-only modules; the client bundle only receives the `NEXT_PUBLIC_FIREBASE_*` values, which are meant to be public (Firebase's own security model relies on Firestore/Storage rules, not on hiding these values). A codebase-wide search for stray `process.env` usage outside the two validated env modules found only two harmless cases (`NODE_ENV` check, public app URL default).

**Firestore & Storage rules.** Firestore rules are owner-read-only with all writes denied at the rules layer (every write in the app goes through the Admin SDK server-side, which bypasses rules by design) — this is a correct defense-in-depth posture. Storage rules lock everything down except `/avatars/{uid}/`, which allows public read (needed for public profile pages) but restricts writes to the owning user, under 5 MB, and image-content-type only.

**CORS.** No custom CORS configuration exists, and none is needed — all API routes are same-origin, called only from the app's own frontend. No public/cross-origin API surface was found.

**Cron endpoint.** `/api/cron/weekly-report` requires a `CRON_SECRET` bearer token and returns 404 (not just 401) when the secret is unset, so it's inert by default rather than an open endpoint waiting for a secret to be added later.

**AI integration (Gemini).** Server-only API key, a hard 30-second timeout via `AbortController` per request, automatic fallback across model names if the configured model is retired, and structured error handling (`AIError`) surfaced to the UI rather than raw exceptions. Input/output guardrails (`src/lib/ai/guardrails.ts`) reject requests with insufficient signal and sanitize/clamp model output before persistence.

**Voice functionality.** Implemented entirely via the browser's native Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`) — no backend dependency, no API key, and the component renders nothing (silently falls back to text input) on unsupported browsers.

**Security headers.** `next.config.ts` sets HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, a restrictive `Permissions-Policy`, and a `Content-Security-Policy` in **Report-Only** mode (intentionally not yet enforced, per an in-code comment, so it can be tuned against real traffic first). Reasonable for a first launch; worth graduating to enforced once you've confirmed no false positives.

**Rate limiting.** Per-user, per-action Firestore-backed rate limiter for expensive AI endpoints. It "fails open" — if the limiter itself errors, the request is allowed rather than blocked — so infrastructure hiccups can't lock out legitimate users.

---

## 3. Core user journey

Verified via route/middleware inspection and gating logic in queries/actions: signup or login → session cookie set → middleware-gated dashboard → career assessment/discovery → recommendations → careers/companies → skill gap → roadmap → timeline/achievements → mock interviews → AI Coach. Every route under `src/app/(app)/*` has both an `error.tsx` and a `loading.tsx` (verified for all ~20 feature routes), plus a root `global-error.tsx` that renders inline-styled markup independent of the app stylesheet (so it still renders correctly even if the CSS itself failed to load) and a `not-found.tsx`. Recommendations/Roadmap correctly gate on assessment completion with clear empty states pointing back to Career Discovery; Careers/Compare are intentionally open for pre-assessment browsing. No dead-end routes were found in the middleware's protected-route matcher.

---

## 4. Previous audit findings — verification

The August 11 product audit flagged one P0 (critical) and five P1 (high-priority) findings. Spot-checked against current code:

- **P0 — fabricated notifications:** **Confirmed fixed.** `DEFAULT_NOTIFICATIONS` is now an empty array with a code comment explaining the fix, and the component actively strips any leftover fabricated entries from a returning user's `localStorage` by matching a `LEGACY_FABRICATED_NOTIFICATION_IDS` set. New users see an honest "No notifications yet" empty state.
- **P1 — onboarding Step 2 forced a career-field pick with no escape hatch:** **Confirmed fixed.** `flow-config.ts` now includes a dedicated "Not sure yet" sentinel option, deliberately excluded from `CAREER_FIELDS` and handled as its own case.
- **P1 — non-functional "Upgrade to Pro" dead end:** **Confirmed fixed/honest.** The pricing view now reads "Pro is coming soon" / "Payments aren't [available yet]" instead of presenting a broken upgrade action as if it worked.
- **P1 — Coach vs. Roadmap sync, dashboard information density:** These are UX/architecture decisions (whether two planning surfaces should share progress data, how many modules the dashboard surfaces at once) rather than defects with a pass/fail state — not re-verified in this pass since they don't affect build safety, auth, or data integrity, and per your severity rules they were correctly non-blocking either way.

All P2/P3 items from that audit (welcome-banner copy, Skill Gap gating consistency, interview default difficulty, unpersisted privacy toggles, leftover root scratch files) remain cosmetic/polish and don't affect deployability.

---

## 5. Repo hygiene (non-blocking, noted for completeness)

Two stray files sit at the project root: `__regression_test_tmp.ts` (a standalone manual regression script for a previously-fixed dashboard crash, imports from `src/`) and `_scratch_delete_test.txt` (a 5-byte placeholder). Neither is imported by any app route, so neither is bundled into the production output or affects runtime — `tsc --noEmit` picks up the `.ts` file only because of the root-level `**/*.ts` include glob, and it type-checks cleanly. Codebase-wide, there are zero `TODO`/`FIXME` markers, zero `@ts-ignore`/`@ts-expect-error` suppressions, zero stray `console.log` debug statements, and only 9 `eslint-disable` comments — all for justified, narrow cases (`react-hooks/exhaustive-deps` on intentional one-time effects, `@next/next/no-img-element` for a handful of avatar/logo images). This is an unusually clean codebase for a pre-launch app.

---

## 6. Deployment Verdict

### DEPLOY NOW

**Why:** No genuine blocker was found anywhere in auth, data handling, security configuration, or the core user journey. Typecheck and lint are both clean. Firestore/Storage rules are correctly locked down. Secrets are properly separated between client and server and none are exposed or hardcoded. The one previously-known critical issue (fabricated notifications) is verifiably fixed, along with two of the five high-priority product issues checked. The only thing this audit could not do is watch a `next build` finish end-to-end, and that failure is attributable to this sandbox's network restrictions (blocked Google Fonts domain), not to anything in the code — typecheck, lint, and manual review of every build-sensitive area (env validation, server/client boundaries, API routes) turned up nothing that would cause a build failure elsewhere.

### Blockers
None identified.

### Important Post-Deployment Fixes
1. Run `npm run build` in your real deploy environment (or let your host's own build step run) as the final green-light check this audit couldn't complete — do this before or immediately after the first deploy.
2. Add an automated test suite (even a small one covering auth session handling, rate limiting, and the assessment→recommendation pipeline) — right now typecheck/lint are the only automated safety net.
3. Graduate the Content-Security-Policy from Report-Only to enforced once you've confirmed no false positives in production.
4. Decide on and configure `EMAIL_PROVIDER`/`RESEND_API_KEY`/`CRON_SECRET` — weekly reports, streak reminders, and the cron endpoint are currently silently inactive rather than broken, but they're real features waiting on config.
5. Resolve the remaining P1 UX items from the prior product audit (Coach/Roadmap progress sync, dashboard first-visit density) at your discretion — neither is a technical risk.

### Optional Improvements
Welcome-banner "welcome back" copy on first visit, Skill Gap's assessment-gating inconsistency with Recommendations/Roadmap, interview difficulty defaulting to "Mid" instead of "Junior," unpersisted Settings privacy toggles (already honestly labeled "Preview"), resume upload/parsing (current builder-first design is a legitimate choice, not a gap), and cleaning up the two stray root files noted in Section 5.

### Final Confidence: 90%

The 10% gap is entirely the unverified production build — every other axis (typecheck, lint, auth architecture, secrets handling, security rules, rate limiting, error boundaries, and the core user journey) checked out clean. Running `npm run build` once in a normal network environment would close that gap.

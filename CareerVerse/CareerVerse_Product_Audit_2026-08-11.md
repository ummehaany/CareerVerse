# CareerVerse — Whole-Product Audit
**Read-only review · August 11, 2026 · Perspective: CEO / Product Owner / senior UX reviewer, evaluating for a first-time student who doesn't yet know what career they want**

Scope respected: Career Discovery (`src/features/assessment/discovery/`) not touched or modified. Email/Resend configuration not evaluated or touched. The recent Dashboard legacy-profile fix in `careerProfiles.ts` was not reopened — no regression found. No files were modified during this audit.

---

## 1. Dashboard

**What a brand-new, undecided student sees on day one** (`src/app/(app)/dashboard/page.tsx`): a welcome banner, an "IntelHero" readiness ring + 4 insight tiles, a "Recommended for you" list of up to 6 action cards, an 8-icon Quick Actions bar, 4 stat cards, a plan/usage card, a profile snapshot, an AI Coach widget, an Analytics widget, and a 6-card "Explore CareerVerse" grid — all in a single render, plus an 18-item sidebar (`src/config/nav.ts`, 3 groups: Main/Growth/Account). Nothing is progressively hidden by onboarding stage.

The good news: the single highest-priority CTA (`IntelHero`'s "Today's priority") is computed correctly — for an undecided student it does say "Complete your career assessment" (`intelligence/engine.ts`, priority 100 beats everything else). That's the right signal.

The problem: it's surrounded by five other "Recommended for you" cards that fire regardless of onboarding status — practice a mock interview, start a resume, generate a roadmap, run a skill-gap analysis, pick a target company (`computeNextActions` in `intelligence/engine.ts`, lines 66–169 add these unconditionally). A student who hasn't figured out a direction yet is told, in the same breath, to pick a target company and analyze skill gaps for a role they haven't chosen.

**Post-Discovery experience**: works as intended — once `onboardingComplete` is true, the same widgets start reflecting real match/roadmap/resume/interview data, and the priority CTA shifts appropriately (recommendations → roadmap → resume, per the priority ladder in `engine.ts`).

**Welcome state**: `WelcomeBanner` (`dashboard/components/welcome-banner.tsx`) always renders "Welcome back, {name}" — including on a user's very first-ever visit, right after signup/onboarding. Minor but real inconsistency.

**Milestone cards**: `OnboardingChecklistCard` (Step-8 "first milestones" card) is well designed — it only appears for users who finished the first-run onboarding wizard, derives completion from live data, and hides itself once done (`onboarding/checklist.ts`). No issues found.

**Profile completeness**: computed from 9 profile fields (`computeProfileCompleteness`, `dashboard/config.ts`) — reasonable, transparent.

**Information architecture redundancy**: Quick Actions (8 items) and the "Explore CareerVerse" feature grid (6 items) overlap heavily with each other and with what `NextActions` already recommends, yet neither includes Target Companies, Skill Gap, Timeline, or Achievements — features the dashboard's own intelligence layer actively pushes users toward via insight tiles and recommendation cards. Those are reachable only through the sidebar. Not a dead end (sidebar has everything), but an inconsistent IA.

**Mobile**: layout classes are systematically responsive (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` etc.), and a dedicated `MobileNav` slide-over exists with focus handling and escape-to-close. No mobile-specific defects found in static review.

| Finding | Evidence | Why it matters | Severity | Fix? |
|---|---|---|---|---|
| Dashboard exposes every module/feature at once regardless of onboarding stage | `dashboard/page.tsx`; `intelligence/engine.ts` `computeNextActions` | Overwhelming for the exact "undecided student" persona this audit centers on; buries the one correct priority CTA in noise | 🟠 P1 | Yes |
| "Welcome back" shown on first-ever visit | `dashboard/components/welcome-banner.tsx` | Small trust/polish issue — product doesn't know if this is your first visit | 🟡 P2 | Yes |
| Dashboard's own shortcut surfaces (Quick Actions, feature grid) omit Companies/Skill Gap/Timeline/Achievements despite promoting them elsewhere on the same page | `dashboard/config.ts` `FEATURE_SECTIONS`/`QUICK_ACTIONS` vs `intelligence/engine.ts` | Inconsistent IA — not a dead end, but adds to overload without a clear reason | 🟡 P2 | Yes |

---

## 2. Career Exploration (Careers, Recommendations, Companies, Compare)

This is the best-connected part of the product. `Recommendations`, `Roadmap`, and (partially) `Companies` correctly gate on `hasCompletedAssessment`, each with a clear, single-purpose empty state that links straight back to Career Discovery (`recommendations/components/recommendations-view.tsx`, `roadmap/components/roadmap-view.tsx`). The chain Assessment → Recommendations → Roadmap is coherent and well-sequenced — this is a genuine strength, worth stating plainly since it's easy to only report problems.

`Careers` (browse) and `Compare` are deliberately open — no assessment wall — which is correct for exploratory browsing. `Compare`'s "Your match score" column shows "Take assessment" until one exists, then a real percentage (`compare/components/compare-view.tsx`), which is a small, well-done connective detail.

`Companies` and `Skill Gap` do **not** gate on assessment the way Recommendations/Roadmap do — `Skill Gap` silently falls back to an arbitrary default career if no assessment exists (`skillgap/queries.ts`). Defensible as a standalone self-serve tool, but it's an inconsistency: some parts of the product insist "assessment first," others don't.

| Finding | Evidence | Why it matters | Severity | Fix? |
|---|---|---|---|---|
| Skill Gap doesn't nudge toward Career Discovery the way Recommendations/Roadmap do | `skillgap/queries.ts` (defaults to `careers[0]` with no assessment) | Minor inconsistency in an otherwise coherent gating pattern | 🟡 P2 | Optional |

---

## 3. Career Journey (Roadmap, Learning, Skill Gap, Coach, Timeline, Achievements)

Roadmap → Learning Hub → Timeline → Achievements form a genuinely coherent chain: Learning Hub ranks resources against the *active roadmap's* missing skills (`learning/queries.ts`), Timeline is literally derived from the roadmap's milestones with no independent data of its own (`timeline/queries.ts`), and Achievements/Analytics passively read the same underlying signals. This is good, connected design.

**The one real coherence gap**: AI Coach's "Career Planning" feature (tour copy: *"Enter any goal and instantly get a complete, personalized career plan"*) generates a full, independent plan — its own month-by-month roadmap, projects, courses, salary bands, interview prep, resume tips (`career-coach/plan-types.ts`) — from any free-text goal, with **no assessment requirement**. This plan is persisted only as a two-message conversation summary (`career-coach/actions.ts`, `upsertConversation`); its milestones are never trackable, never contribute to the Dashboard's "Roadmap progress" stat, never appear on Timeline, and don't sync with the canonical Roadmap feature at all. A student could reasonably generate a "complete career plan" via Coach and believe that's their roadmap — it isn't connected to anything else in the product.

| Finding | Evidence | Why it matters | Severity | Fix? |
|---|---|---|---|---|
| Two independent, non-syncing "roadmap generation" systems (Roadmap vs. Coach's Career Planning) | `career-coach/actions.ts` `generateCareerPlanAction`; `career-coach/plan-types.ts`; contrast with `roadmap/queries.ts` | A student's Coach-generated plan produces no trackable progress anywhere else — Dashboard, Timeline, and Achievements never see it. Breaks "one system" feeling explicitly | 🟠 P1 | Yes |

---

## 4. Resume & Portfolio

Both are correctly positioned as **builders**, not upload-only tools. `getResumePageData` (`resume/queries.ts`) always returns an editable draft — pre-filled with name/email and, if Career Discovery is complete, skills/interests pulled from the assessment — never a hard "you need a resume" wall. Same pattern for Portfolio (`portfolio/queries.ts`, `seedPortfolio`). This is the right call for a student who has never had a resume: they're never blocked, and the empty state *is* a working editor, not a locked page.

**Observation** (not a defect, but the audit brief asked to check it explicitly): there is no resume **upload/parsing** capability anywhere in the codebase — confirmed by a codebase-wide search of the `resume` feature. Students with an existing resume must re-enter it manually (with AI-assist to draft sections). Given the instruction not to invent requirements, this is reported as a factual gap, not a recommendation to build it before launch — the current builder-first positioning is legitimate and matches the "student may not have a resume yet" framing well.

| Finding | Evidence | Why it matters | Severity | Fix? |
|---|---|---|---|---|
| No resume upload/parse feature exists | Codebase search of `src/features/resume/*` | Informational only — current builder-first design is actually well-suited to students without an existing resume | 🔵 P3 | Not urgent |

---

## 5. Interview Preparation

Well-designed for a first-timer: the setup screen explains each interview type in plain language (`interview/config.ts`), shows history/analytics with honest empty states ("No interviews yet — your scores and trends will appear here"), and offers a "continue previous interview" draft-resume path (`interview-dashboard.tsx`). No assessment wall — a student can practice immediately, which is correct for this feature.

One small mismatch: the difficulty selector defaults to **"Mid-level"** (`interview-setup.tsx`, `useState<InterviewDifficulty>("mid")`) rather than "Junior / entry-level," which is the more natural default for the primary student persona and matches nobody's actual first-interview reality.

| Finding | Evidence | Why it matters | Severity | Fix? |
|---|---|---|---|---|
| Interview difficulty defaults to "Mid-level," not "Junior" | `interview/components/interview-setup.tsx` line 35 | Small mismatch with the primary persona's expectations; trivial one-line fix | 🟡 P2 | Yes |

---

## 6. Account & Core Product

**Auth**: signup/login/OAuth, email verification, and password reset all use Firebase Auth's own email delivery (`sendEmailVerification`, `sendPasswordResetEmail` in `auth/api.ts`) — **independent of the postponed Resend integration**. Confirmed this is not at risk from the email-system postponement. Good separation of concerns.

**First-run onboarding wizard** (`onboarding/components/onboarding-flow.tsx`, distinct from Career Discovery): this is the most significant finding in the whole audit. Steps 1–4 ask for career goal, career field, current level, and target companies, with a loading screen reading *"🤖 Understanding your goals... 🎯 Personalizing company recommendations... 🧠 Configuring AI Career Assistant..."* and on-screen copy that says *"we'll use them to personalize recommendations."* A codebase-wide search confirms **none of these four answers are ever read anywhere else in the application** — not by Recommendations, not by Companies/dream-company tracking, not by Coach, not by Roadmap. `user.onboarding.careerGoal/careerField/currentLevel/targetCompanies` is written once by `completeOnboarding` (`lib/firebase/firestore/users.ts`) and read back exactly once, only to prefill the same form if a user revisits `/onboarding` (`src/app/onboarding/page.tsx`). The "AI personalizing" sequence and the "we'll use them" promise describe work that does not happen.

Compounding this: Step 2 ("Which field interests you the most?") is a **required** single-select with no "not sure" option (`flow-config.ts` `CAREER_FIELDS`; `canNext` in `onboarding-flow.tsx` blocks progress without a selection) — directly at odds with the exact persona this audit is centered on: a student who doesn't know what career they want yet. (Step 1's career-goal question *does* correctly offer "I'm Not Sure Yet" — the inconsistency is specifically Step 2.) A "Skip setup" escape hatch exists, but only on the very first welcome screen, before any question is asked.

**Notifications** (bell icon, always visible in the topbar via `AppShell`): entirely fabricated. `DEFAULT_NOTIFICATIONS` (`features/notifications/data.ts`) is a hardcoded array — "New career matches ready," "Mock interview feedback ready," "Achievement unlocked," etc. — seeded into every user's `localStorage` on first load with **no connection to any real backend event** (`notifications/components/notifications.tsx`, lines 42–57). A brand-new student who has done nothing will see "Mock interview feedback ready" and "Achievement unlocked" in their notification bell. This is the clearest concrete trust issue found in the audit.

**Settings**: mostly solid and honestly labeled — "Connected Accounts" and full data export are explicitly marked "Coming soon"; the "Privacy" toggles (public profile, discoverable by recruiters, etc.) are local React state only, not persisted, but are labeled "Preview" with an explanatory caption underneath (`settings/components/preferences.tsx`) — disclosed, not deceptive, though still incomplete.

**Pricing/Pro**: the comparison table and plan cards are complete and clearly written, but "Upgrade to Pro" only shows a "💳 Payments coming soon" toast — there is no payment provider wired up (`subscription/components/pricing-view.tsx`). This is honestly disclosed in the UI, but combined with real, enforced Free-plan limits (2 mock interviews/month, 3 Resume AI/month, 3 AI Career Plans/month — `subscription/config.ts`), an engaged student preparing for interviews can hit a hard, un-escapable usage wall.

| Finding | Evidence | Why it matters | Severity | Fix? |
|---|---|---|---|---|
| Notification bell shows fabricated, hardcoded "activity" to every user regardless of real usage | `notifications/data.ts` (`DEFAULT_NOTIFICATIONS`); `notifications/components/notifications.tsx` lines 42–57 | Actively misrepresents the student's own account activity, on every page, from first login onward — a direct trust breach | 🔴 P0 | Yes |
| Onboarding wizard's personalization answers (goal/field/level/target companies) are captured with an "AI personalizing" loading screen and an explicit "we'll use them to personalize recommendations" promise, but are never consumed by any feature in the codebase | `onboarding/actions.ts`, `lib/firebase/firestore/users.ts` `completeOnboarding`, confirmed via full-codebase search — only re-read in `src/app/onboarding/page.tsx` to prefill the same form | The student's very first substantive interaction with the product makes a promise the code doesn't keep | 🟠 P1 | Yes |
| Onboarding Step 2 forces a required career-field pick with no "not sure" option | `onboarding/flow-config.ts` `CAREER_FIELDS`; `onboarding-flow.tsx` `canNext` | Directly contradicts the "undecided student" persona; Step 1 handles this correctly, Step 2 doesn't | 🟠 P1 | Yes |
| Free-plan usage caps (esp. 2 mock interviews/month) paired with a non-functional "Upgrade to Pro" | `subscription/config.ts` `FREE_LIMITS`; `subscription/components/pricing-view.tsx` | Real dead end for the most engaged students (interview-prep persona) | 🟠 P1 | Yes |
| Privacy toggles in Settings don't persist (local state only) | `settings/components/preferences.tsx` `PrivacySettings` | Disclosed as "Preview," so not deceptive, but incomplete | 🟡 P2 | Yes |

---

## 7. Cross-Product Student Journeys

**A. New student, no idea what career they want.**
Signup → onboarding wizard (forced to pick a "career field" despite genuine uncertainty; loading screen implies real personalization that doesn't happen) → Dashboard. The correct "Today's priority" CTA (Complete your career assessment) is present and computed correctly, but it competes with 20+ other visible entry points (Quick Actions, 6 recommendation cards, 4 stat cards, 6 feature cards, 18-item sidebar), several of which — mock interview, resume, roadmap, skill gap, target company — are premature for someone with no direction yet. No dead ends found. Repetition is real: the same handful of features (assessment, roadmap, resume, interviews) appear in four different dashboard surfaces simultaneously.

**B. Completes Discovery, wants to explore recommended careers.**
Recommendations → Careers/Compare → Roadmap is a clean, well-gated, logically sequenced chain — this journey works well. The one wrinkle: Coach's "Career Planning" offers a parallel, ungated way to get "a complete personalized career plan" from any typed goal, which doesn't feed the same roadmap/progress system the guided path does — a student could take this shortcut and end up disconnected from Timeline/Achievements/Dashboard progress tracking.

**C. Chosen a target career, wants to build skills.**
Roadmap → Learning Hub → Timeline → Achievements is the most coherent chain in the product — each screen genuinely reflects the same underlying roadmap data rather than re-asking the same questions.

**D. Preparing for internships/jobs.**
Companies (target-company readiness) → Skill Gap → Resume → Interviews is logically connected and IntelHero surfaces target-company progress directly. The friction point is real: this is the persona most likely to hit the 2-mock-interview/month Free cap, at which point the only offered path forward ("Upgrade to Pro") doesn't work.

**E. Returning after inactivity.**
Dashboard recomputes readiness/streak/priority live on every visit — no stale state found. However, the notification bell shows the same fabricated placeholder items regardless of how long the student was away, which undercuts exactly the "welcome back, here's what changed" moment this persona needs most.

---

## 8. Findings Summary (severity-classified)

🔴 **P0 — deployment blocker / broken functionality / serious trust issue (1)**
1. Fabricated notifications shown to every user as real activity (`features/notifications/`).

🟠 **P1 — important UX/product problem, should fix before launch (5)**
1. Onboarding personalization data (goal/field/level/target companies) collected with an explicit "will personalize your experience" promise, never consumed anywhere.
2. Onboarding Step 2 forces a career-field choice with no "not sure" option, contradicting the undecided-student persona.
3. Dashboard exposes every module/feature at once regardless of onboarding stage — no progressive disclosure.
4. Two disconnected "roadmap generation" systems (canonical Roadmap vs. Coach's Career Planning) that don't sync progress.
5. Free-plan usage caps combined with a non-functional "Upgrade to Pro" button — real dead end for the most engaged students.

🟡 **P2 — worthwhile polish, not launch-blocking (5)**
1. "Welcome back" copy shown on a user's first-ever dashboard visit.
2. Dashboard's own shortcut surfaces omit Companies/Skill Gap/Timeline/Achievements despite promoting them elsewhere on the same page.
3. Skill Gap doesn't follow the same "assessment first" gating pattern as Recommendations/Roadmap.
4. Interview difficulty defaults to "Mid-level" instead of "Junior."
5. Settings "Privacy" toggles don't persist (though honestly labeled "Preview").

🔵 **P3 — post-launch enhancement (3)**
1. No resume upload/parsing exists (current builder-first design is a legitimate choice, not a defect).
2. "Connected Accounts" and full data export are stubbed and clearly labeled "Coming soon."
3. Leftover root-level `_to_delete` / `*_delete-me` directories (confirmed excluded from the TS project and build; `tsc --noEmit` and `next lint` both pass clean).

**What's working well** (for balance): the Assessment → Recommendations → Roadmap → Learning → Timeline chain is genuinely coherent and well-gated with clear, single-purpose empty states; Resume/Portfolio are correctly positioned as always-open builders rather than locked-until-you-have-one tools; Compare and Careers are appropriately open for pre-Discovery browsing; auth flows are fully independent of the postponed email system; and the codebase is clean under `tsc --noEmit` and `next lint` with zero errors.

---

## CEO / Product Owner Verdict

- **Overall product quality: 7/10**
- **Student UX: 6/10**
- **Product coherence: 6/10**
- **Technical reliability: 8/10**
- **Deployment readiness: 6/10**

- **P0 blockers: 1**
- **P1 issues: 5**
- **P2 issues: 5**
- **P3 issues: 3**

### "If I were the CEO/Product Owner, would I deploy CareerVerse today?"

**NO.**

1. The notification bell fabricates a student's own activity history from their very first login — a small, contained fix, but shipping it knowingly would be a real trust breach the moment anyone looks closely.
2. The first-run onboarding wizard — the product's very first substantive interaction with a new student — explicitly promises personalization ("we'll use them to personalize recommendations," an "AI personalizing" loading sequence) that the code does not deliver anywhere downstream.
3. Neither issue requires touching Career Discovery, the recent Dashboard fix, or the postponed email system, and neither is architecturally deep — both are realistically fixable in a short, targeted pass, after which the product's actual foundation (gating logic, empty states, the Discovery→Matches→Roadmap→Learning chain, technical hygiene) is solid enough to support a launch.

### Recommended implementation order (highest priority first)

1. Fix or remove the fabricated notifications (🔴 P0) — either wire the bell to real backend events or replace the seeded fake list with an honest empty state until real events exist.
2. Resolve the orphaned onboarding-personalization data (🟠 P1) — either wire `careerGoal`/`careerField`/`currentLevel`/`targetCompanies` into recommendations/companies, or remove the "personalizes recommendations" claim and the "AI personalizing" theater until it's actually connected.
3. Add an escape hatch to onboarding Step 2 ("Not sure yet" option or make it skippable), matching what Step 1 already does correctly (🟠 P1).
4. Reduce Dashboard's first-visit density — gate the "Recommended for you" list and/or Quick Actions more tightly to onboarding stage so a brand-new student sees fewer, more sequential prompts (🟠 P1).
5. Decide the relationship between Coach's "Career Planning" and the canonical Roadmap — either sync their progress data or clearly differentiate the two in-product so students don't mistake one for the other (🟠 P1).
6. Address the Free-plan mock-interview cap / non-functional upgrade path — raise the cap, or make the "Pro" state honest (e.g., a waitlist) rather than a dead-end button (🟠 P1).
7. P2 polish batch: welcome-banner copy, Skill Gap gating consistency, interview default difficulty, persisting the Privacy toggles, dashboard IA cleanup.
8. P3 backlog: resume upload/parse (as a genuine future enhancement, not a launch requirement), Connected Accounts, full data export, repo cleanup of leftover `_delete-me` directories.

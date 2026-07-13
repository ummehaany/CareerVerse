# CareerVerse — Application Architecture

**Status:** Approved — revised (v2)
**Author:** Architecture design pass
**Revisions (v2):** (1) Default AI provider changed to **Google Gemini** — the provider-agnostic abstraction is unchanged. (2) **Opportunities module deferred to V2** (post-MVP). (3) A **functional dashboard is built immediately after authentication** (Phase 3) so users see value at login.
**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Firebase Auth · Cloud Firestore · Firebase Storage · Provider-agnostic AI layer (Google Gemini default)

---

## 1. Product summary

CareerVerse is an AI-powered career development platform for students and professionals. The product's job is to guide a person through a continuous career journey rather than to serve a single transaction. The core loops are:

1. **Discover** — an onboarding assessment (interests, skills, personality, goals) produces an AI-generated career profile.
2. **Explore** — the user browses careers/roles matched to that profile and drills into detail.
3. **Plan** — the AI generates a personalized learning roadmap toward a target role, which the user tracks over time.
4. **Prepare** — resume building (AI-assisted) and AI mock interviews with feedback.
5. **Mentor** — a persistent AI mentor that has context on the user's profile and progress, available continuously.
6. **Opportunities (V2)** — a supporting surface for exploring roles/opportunities; deferred to a post-MVP V2 release.

Everything below is organized so these loops can be built one at a time on a shared foundation, without rework.

### Architectural principles

- **Server-first.** Default to React Server Components and server-side data access. The browser never holds the Firebase Admin credentials or AI provider keys.
- **Feature-modular.** Each product loop is a self-contained feature module (its own components, hooks, server actions, schemas). Shared primitives live in one place; features never reach into each other.
- **Abstraction at the volatile boundaries.** The AI provider and the data store are both accessed through thin, typed interfaces so an implementation can be swapped or tested without touching feature code.
- **Typed end to end.** TypeScript everywhere, Zod at every trust boundary (form input, API input, AI output, environment variables).
- **Secure by default.** Auth verified on the server, Firestore Security Rules as defense-in-depth, least-privilege access, AI usage metered and rate-limited.
- **Incrementally shippable.** Each roadmap phase produces something demonstrable.

---

## 2. System architecture (layers)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Browser (Next.js client components)                                   │
│  • Firebase Client SDK: interactive sign-in, realtime listeners only   │
│  • React context providers (Auth, Theme, Query)                        │
│  • Streaming UI for AI (mentor chat, interview)                        │
└───────────────▲───────────────────────────────────┬──────────────────┘
                │ session cookie (httpOnly)          │ RSC payloads / SSE
┌───────────────┴───────────────────────────────────▼──────────────────┐
│  Next.js Server (App Router)                                          │
│  • Server Components (data fetching)   • Server Actions (mutations)    │
│  • Route Handlers /api (AI streaming, auth session, webhooks)         │
│  • middleware.ts (route protection)                                   │
├───────────────────────────────────────────────────────────────────────┤
│  Service layer (server-only)                                          │
│  • lib/ai        → provider-agnostic AI interface + domain services   │
│  • lib/firebase  → Admin SDK, session helpers, Firestore repositories │
│  • lib/validation→ shared Zod schemas   • lib/usage → metering        │
├───────────────▲───────────────────────────────────▲──────────────────┘
                │                                     │
┌───────────────┴───────────┐        ┌────────────────┴──────────────────┐
│  Firebase                 │        │  AI Providers                      │
│  • Auth  • Firestore      │        │  • Google Gemini (default)         │
│  • Storage • Rules        │        │  • (swappable adapters)            │
└───────────────────────────┘        └────────────────────────────────────┘
```

**Why two Firebase access paths.** The **Admin SDK** (server) is the primary, trusted path — it performs all writes and sensitive reads, keeps AI keys and business logic server-side, and bypasses Security Rules with full authority. The **Client SDK** (browser) is used narrowly for two things it does uniquely well: interactive authentication UI and **realtime listeners** (live mentor messages, notifications). Those client reads are gated by Security Rules. This split gives us the security of a server backend and the responsiveness of Firebase's realtime layer without choosing one or the other.

---

## 3. Folder organization

Extends the scaffold already in place. New directories are marked `＋`.

```
careerverse/
├── src/
│   ├── app/                          # App Router: routing, layouts, API
│   │   ├── (marketing)/           ＋ # public, unauthenticated pages
│   │   ├── (auth)/                ＋ # login / signup / password reset
│   │   ├── (app)/                 ＋ # authenticated product (app shell)
│   │   ├── (admin)/               ＋ # internal admin console
│   │   ├── api/                   ＋ # route handlers (AI streaming, auth, webhooks)
│   │   ├── layout.tsx                # root layout (providers, fonts, <html>)
│   │   ├── globals.css              # Tailwind entry + design tokens
│   │   ├── not-found.tsx          ＋
│   │   ├── error.tsx              ＋ # global error boundary
│   │   └── loading.tsx           ＋
│   │
│   ├── features/                  ＋ # one folder per product loop (see §4)
│   │   ├── assessment/               #   components/ hooks/ actions.ts schema.ts types.ts
│   │   ├── careers/
│   │   ├── roadmap/
│   │   ├── resume/
│   │   ├── interview/
│   │   ├── mentor/
│   │   └── opportunities/
│   │
│   ├── components/                   # SHARED, feature-agnostic UI
│   │   ├── ui/                       #   primitives: button, input, card, dialog…
│   │   ├── layout/                   #   shell: sidebar, topbar, footer, nav
│   │   ├── forms/                 ＋ #   form field wrappers (RHF + Zod)
│   │   └── shared/                ＋ #   empty states, skeletons, error views
│   │
│   ├── lib/                          # framework-agnostic logic (server-leaning)
│   │   ├── firebase/              ＋
│   │   │   ├── client.ts             #   Client SDK init (browser)
│   │   │   ├── admin.ts              #   Admin SDK init (server-only)
│   │   │   ├── auth.ts               #   session cookie mint/verify helpers
│   │   │   └── firestore/            #   repositories, one per collection
│   │   │       ├── users.ts
│   │   │       ├── careers.ts
│   │   │       ├── roadmaps.ts
│   │   │       └── …
│   │   ├── ai/                    ＋ # provider-agnostic AI layer (see §9)
│   │   │   ├── types.ts              #   AIProvider interface
│   │   │   ├── providers/            #   gemini.ts (default), anthropic.ts, openai.ts…
│   │   │   ├── prompts/              #   versioned prompt templates
│   │   │   ├── services/             #   domain AI services (advisor, coach…)
│   │   │   ├── guardrails.ts
│   │   │   └── index.ts              #   factory: picks provider from env
│   │   ├── validation/           ＋ #   shared Zod schemas
│   │   ├── env.ts                ＋ #   typed, validated environment access
│   │   ├── constants.ts          ＋
│   │   └── utils.ts                  #   cn() and small helpers (exists)
│   │
│   ├── hooks/                        # global hooks (useAuth, useMediaQuery…)
│   ├── providers/                ＋ # React context providers
│   ├── config/                       # site.ts (exists), nav.ts＋, routes.ts＋
│   ├── types/                        # global TS types + Firestore models
│   └── middleware.ts             ＋ # edge route protection
│
├── firestore.rules               ＋ # Firestore Security Rules
├── firestore.indexes.json        ＋ # composite index definitions
├── storage.rules                 ＋ # Storage Security Rules
├── firebase.json                 ＋ # Firebase project config / emulators
└── docs/
    └── ARCHITECTURE.md              # this document
```

**Why `features/` alongside `components/`.** As the app grows, the failure mode is a giant flat `components/` folder where nothing has a clear owner. Splitting by feature means everything for, say, mock interviews (its UI, its hooks, its server actions, its Zod schemas) lives in `features/interview/` and can be reasoned about, tested, or removed as a unit. `components/` is reserved strictly for things shared across features (the button, the sidebar). The rule of thumb: if two features need it, it moves down to `components/` or `lib/`; otherwise it stays in the feature.

**Why the `lib/firebase/firestore/` repository pattern.** Feature code never calls Firestore directly. Instead each collection has a repository module exposing typed functions (`getUser`, `createRoadmap`, `listCareersByCategory`). This keeps query logic in one place, makes features unit-testable against a mocked repository, and means a Firestore schema change touches one file instead of twenty.

---

## 4. Feature modules

Each product loop maps to a feature module with a consistent internal shape:

```
features/<name>/
├── components/     # feature-specific React components
├── hooks/          # feature-specific hooks
├── actions.ts      # server actions (mutations)
├── queries.ts      # server-side reads (compose repositories)
├── schema.ts       # Zod schemas (input + AI output)
└── types.ts        # feature TypeScript types
```

| Module | Responsibility | Primary AI service | Primary collections |
|---|---|---|---|
| `assessment` | Onboarding questionnaire → AI career profile | `assessmentAnalyzer` | `users/{uid}/assessments`, `careerProfiles` |
| `careers` | Browse/search careers, detail pages, match scoring | `careerAdvisor` | `careers`, `skills` |
| `roadmap` | Generate & track personalized learning roadmaps | `roadmapGenerator` | `users/{uid}/roadmaps` |
| `resume` | AI-assisted resume building, versioning, export | `resumeAssistant` | `users/{uid}/resumes` |
| `interview` | Mock interview sessions, streamed Q&A, scored feedback | `interviewCoach` | `users/{uid}/interviews` |
| `mentor` | Persistent AI mentor chat with profile context | `mentorChat` | `users/{uid}/conversations` |
| `opportunities` *(V2)* | Explore & save career opportunities (supporting) — **deferred to V2** | `careerAdvisor` (match) | `opportunities`, `users/{uid}/savedOpportunities` |

---

## 5. Routing & pages (App Router)

Routes are organized with **route groups** — parentheses folders that group pages by layout and access level without adding URL segments. Four groups: marketing (public), auth (public, minimal chrome), app (authenticated shell), admin (role-gated).

### Public — `(marketing)/`

| Route | Page | Rendering |
|---|---|---|
| `/` | Landing / value proposition | Static |
| `/about` | About | Static |
| `/pricing` | Plans | Static |
| `/contact` | Contact | Static |
| `/legal/privacy`, `/legal/terms` | Legal | Static |

### Auth — `(auth)/`

| Route | Page |
|---|---|
| `/login` | Sign in (email/password + OAuth) |
| `/signup` | Create account |
| `/forgot-password` | Request reset email |
| `/verify-email` | Email verification landing |

### Authenticated app — `(app)/`

| Route | Page | Notes |
|---|---|---|
| `/onboarding` | First-run assessment flow | Redirect target until profile complete |
| `/dashboard` | Home: profile snapshot, active roadmap, next actions | Aggregates across features |
| `/careers` | Browse/search careers | Filter, match scores |
| `/careers/[careerId]` | Career detail | Skills, outlook, related roles |
| `/roadmap` | Roadmap list | |
| `/roadmap/[roadmapId]` | Roadmap detail + progress | Milestone tracking |
| `/resume` | Resume list | |
| `/resume/[resumeId]` | Resume editor | AI suggestions inline |
| `/interviews` | Interview history + start new | |
| `/interviews/[interviewId]` | Live/replay interview session | Streamed |
| `/mentor` | Conversation list / new chat | |
| `/mentor/[conversationId]` | Mentor chat thread | Streamed, realtime |
| `/opportunities` *(V2)* | Explore opportunities | Post-MVP |
| `/opportunities/[id]` *(V2)* | Opportunity detail | Post-MVP (save / match) |
| `/profile` | Career profile view/edit | |
| `/settings` | Account, notifications, plan, danger zone | Nested tabs |

### Admin — `(admin)/` (role `admin` only)

| Route | Page |
|---|---|
| `/admin` | Overview metrics |
| `/admin/careers` | Manage careers catalog |
| `/admin/skills` | Manage skills taxonomy |
| `/admin/users` | User management |
| `/admin/ai` | Prompt/version + usage monitoring |

**Rendering strategy.** Marketing pages are static. App pages are dynamic server-rendered (per-user data via RSC). AI-interactive surfaces (mentor, interview) render a server shell and stream tokens over the network to client components. Each dynamic segment gets a `loading.tsx` (skeleton) and `error.tsx` (boundary).

---

## 6. Navigation

Navigation is **data-driven** from `config/nav.ts`, so links, icons, grouping, and required roles are declared once and consumed by every nav surface. This keeps the sidebar, mobile menu, and command palette in sync and makes gating a route a one-line change.

- **Marketing header** — logo, section links, "Log in" / "Get started".
- **App sidebar** (desktop) — primary product areas (Dashboard, Careers, Roadmap, Resume, Interviews, Mentor, Opportunities) with the current profile summary and a collapsible state. Secondary group for Profile/Settings.
- **App topbar** — page title/breadcrumb, global search / command palette, notifications, user menu.
- **Mobile** — the sidebar collapses into a drawer plus an optional bottom tab bar for the most-used destinations.
- **Command palette** (⌘K) — quick jump to any nav destination and quick actions ("New interview", "Ask mentor").

Access-gated items are filtered against the current user's role before render, so an admin-only link never appears for a normal user.

---

## 7. Layouts

Layouts nest to match the route groups, each owning a distinct chrome:

- **Root layout** (`app/layout.tsx`) — `<html>`/`<body>`, fonts, global CSS, and the top-level context providers (Auth, Theme, Query). Everything renders inside it.
- **Marketing layout** — public header + footer; no auth requirement.
- **Auth layout** — centered, minimal, distraction-free card; redirects **away** to `/dashboard` if already signed in.
- **App layout** — the authenticated shell (sidebar + topbar). Verifies the session server-side, loads the current user once, and provides it to the subtree; redirects to `/login` if unauthenticated and to `/onboarding` if the profile is incomplete.
- **Admin layout** — app shell variant that additionally requires the `admin` role.

Because the app shell lives in a layout, it renders once and persists across in-group navigations — only the page slot re-renders.

---

## 8. Reusable components & design system

Three tiers, from generic to specific:

1. **UI primitives** (`components/ui/`) — the design-system atoms: `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Card`, `Dialog`, `Sheet`, `Tabs`, `Tooltip`, `Badge`, `Avatar`, `DropdownMenu`, `Toast`, `Skeleton`, `Progress`. Styling via Tailwind v4 tokens defined in `globals.css`; variants via a small class-variance utility. These know nothing about CareerVerse.
2. **Composition components** (`components/layout/`, `components/forms/`, `components/shared/`) — the app shell (`Sidebar`, `Topbar`, `NavItem`, `UserMenu`, `CommandPalette`), form building blocks that bind React Hook Form + Zod (`FormField`, `FormError`, `SubmitButton`), and cross-cutting states (`EmptyState`, `LoadingState`, `ErrorState`, `PageHeader`).
3. **Feature components** (`features/*/components/`) — assembled from the above for a specific loop (`AssessmentStepper`, `CareerCard`, `RoadmapTimeline`, `ResumeEditor`, `InterviewStage`, `MentorMessageList`).

**Why the tiers.** A component's tier tells you its dependencies and its blast radius. Primitives are stable and heavily reused; feature components change often and are owned by one team/area. Enforcing "features build on shared, never the reverse" prevents the dependency tangle that makes large front-ends hard to change.

A note on the **design system**: the `dataviz` and `design-system` skills available in this workspace should inform the token palette and any progress/score visualizations (roadmap progress, interview scores, skill coverage) so those read as one coherent system.

---

## 9. Authentication flow (Firebase Auth)

Firebase Auth handles identity; we add a **server session** so React Server Components and route handlers can trust the user without a client round-trip.

**Providers:** email/password (with email verification), Google OAuth, and GitHub OAuth (developer-leaning audience). All configured in the Firebase console and surfaced through the auth pages.

**The session-cookie pattern (production standard):**

```
1. User signs in via Firebase Client SDK on /login (or /signup).
       └─ returns a Firebase ID token (JWT) in the browser.
2. Client POSTs the ID token to  POST /api/auth/session.
3. Route handler verifies the ID token with the Admin SDK and mints a
   Firebase *session cookie* (httpOnly, Secure, SameSite=Lax, ~5-day TTL).
4. Browser stores the httpOnly cookie; JS can't read it (XSS-resistant).
5. Every server render / API call reads the cookie and verifies it with
   the Admin SDK to obtain a trusted uid + claims — no client trust needed.
6. Sign-out → POST /api/auth/session (DELETE) clears the cookie and
   revokes the session server-side.
```

**Route protection (`middleware.ts`).** Edge middleware checks for the session cookie's presence and redirects unauthenticated requests away from `(app)`/`(admin)` and authenticated requests away from `(auth)`. Middleware does a cheap presence check only; the **authoritative** verification happens in the app-layout server component (and in each API route) via the Admin SDK, because middleware runs on the edge where the Admin SDK isn't available. This two-tier check (fast redirect + trusted verification) is deliberate.

**Authorization / roles.** Roles (`student`, `professional`, `admin`) are stored both as a **custom claim** on the Firebase user (available in the verified token, used for fast gating and Security Rules) and mirrored on the `users` document (for querying/display). Admin-setting of claims happens server-side only.

**Account bootstrap.** On first successful sign-up, a server action creates the `users/{uid}` document and an empty `careerProfiles/{uid}`, sets `onboardingComplete: false`, and routes the user into `/onboarding`. The user document is the source of truth that ties Firebase Auth identity to app data.

---

## 10. Database — Firestore data model

Firestore is document/collection based. The guiding decisions: **user-owned, time-series data lives in subcollections** under `users/{uid}` (natural ownership → simple Security Rules, unbounded growth without bloating the parent doc); **shared catalog data lives in top-level collections** (read-mostly, admin-written); and we **denormalize deliberately** (store the fields a screen needs on the document it reads) because Firestore has no joins and bills per document read.

### Top-level collections

**`users/{uid}`** — account core.
```
uid, email, displayName, photoURL,
role: 'student' | 'professional' | 'admin',
onboardingComplete: boolean,
plan: 'free' | 'pro',
createdAt, updatedAt, lastActiveAt
```

**`careerProfiles/{uid}`** — the rich career profile (kept separate from the account doc so it can grow and have its own rules).
```
uid,
education[], experience[], currentRole,
skills: [{ skillId, level }], interests[], goals[],
targetRoles[], strengths[], aiSummary,   // AI-derived
updatedAt
```

**`careers/{careerId}`** — shared catalog (admin-managed).
```
title, slug, category, description,
requiredSkills: [{ skillId, importance }],
salaryRange, outlook, education, relatedCareerIds[]
```

**`skills/{skillId}`** — skill taxonomy. `{ name, slug, category, description }`

**`opportunities/{opportunityId}`** *(V2 — post-MVP)* — supporting opportunities feed.
```
title, company, location, type, description,
requiredSkillIds[], source, url, postedAt
```

### User-owned subcollections (under `users/{uid}/`)

| Subcollection | Document shape (abridged) | Purpose |
|---|---|---|
| `assessments/{id}` | `type, status, responses[], result, aiCareerProfile, createdAt` | Each assessment attempt + AI output |
| `roadmaps/{id}` | `targetCareerId, title, milestones[{title, skillIds, resources[], status}], progress, status, createdAt` | Learning roadmaps + progress |
| `resumes/{id}` | `title, template, sections{}, versions[], aiSuggestions[], updatedAt` | Resume documents + versions |
| `interviews/{id}` | `role, config, questions[], responses[], scores{}, aiFeedback, status, createdAt` | Mock interview sessions |
| `conversations/{id}` | `title, contextRef, createdAt, updatedAt` | Mentor chat threads |
| `conversations/{id}/messages/{mid}` | `role: 'user'\|'assistant', content, tokens, createdAt` | Chat messages (streamed + persisted) |
| `savedOpportunities/{id}` *(V2)* | `opportunityId, savedAt, status` | Saved/pursued opportunities (post-MVP) |
| `notifications/{id}` | `type, title, body, read, createdAt` | In-app notifications |

### Operational collections

**`usage/{uid}`** — AI metering & quota per user per period `{ period, requests, tokensIn, tokensOut, updatedAt }`. Read before each AI call to enforce rate limits and plan quotas.

**`aiPrompts/{promptId}`** — optional: versioned prompt templates managed from the admin console, so prompts can be tuned without a deploy.

### Indexes, rules, integrity

- **Composite indexes** (`firestore.indexes.json`) for the real query patterns: conversations by `updatedAt desc`, roadmaps by `status` + `updatedAt`, careers by `category` + `title`, opportunities by `postedAt desc`.
- **Security Rules** (`firestore.rules`) as defense-in-depth for the client-SDK realtime path: a user may read/write only documents under their own `users/{uid}` tree (`request.auth.uid == uid`); catalog collections (`careers`, `skills`, `opportunities`) are world-readable but writable only with the `admin` claim; `usage` and operational writes are server-only. The Admin SDK path bypasses rules and remains the primary writer.
- **Integrity.** Firestore has no foreign keys, so cross-document consistency (e.g., updating a roadmap's cached career title) is handled in repositories, with denormalized fields refreshed on write and, where needed, a scheduled reconciliation.

---

## 11. API structure

Two complementary mechanisms, chosen by use case:

**Server Actions** — the default for mutations initiated from the UI (submit assessment, save resume section, create roadmap, update profile). They are colocated in each feature's `actions.ts`, run on the server, verify the session, validate input with Zod, call a repository and/or AI service, and revalidate the affected paths. No hand-written endpoint or client fetch code — this is the primary write path.

**Route Handlers (`app/api/`)** — used where an action isn't the right tool:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/session` | POST / DELETE | Mint / clear the Firebase session cookie |
| `/api/ai/mentor` | POST | **Streamed** mentor responses (SSE) |
| `/api/ai/interview` | POST | **Streamed** interview questions/feedback |
| `/api/ai/roadmap` | POST | Generate a roadmap (structured output) |
| `/api/ai/resume` | POST | Resume suggestions (structured output) |
| `/api/ai/assessment` | POST | Analyze assessment → career profile |
| `/api/webhooks/*` | POST | External callbacks (e.g., billing) |

**Conventions.** Every handler: (1) verifies the session cookie via Admin SDK; (2) validates the body with a Zod schema from `lib/validation`; (3) checks `usage` quota for AI routes; (4) returns a consistent envelope — `{ data }` on success, `{ error: { code, message } }` on failure — with correct HTTP status. Streaming routes return a `ReadableStream` and the client consumes tokens progressively. The reason AI calls are route handlers rather than actions is streaming: token-by-token UI needs a streamed HTTP response, which route handlers provide cleanly.

---

## 12. AI service layer (provider-agnostic)

The AI layer is a stack of three levels so that feature code depends only on **domain intent**, never on a specific model SDK.

**Level 1 — Provider interface (`lib/ai/types.ts`).** A single interface every provider implements:
```
interface AIProvider {
  generateText(opts): Promise<TextResult>
  streamText(opts): AsyncIterable<TextChunk>
  generateObject<T>(schema: ZodSchema<T>, opts): Promise<T>   // structured output
  embed(input): Promise<number[]>
  readonly capabilities: { streaming: boolean; embeddings: boolean }
}
```

**Level 2 — Provider adapters (`lib/ai/providers/`).** `gemini.ts` implements the interface against Google Gemini and is the **default**; `anthropic.ts` (Claude) and `openai.ts` are alternate adapters that can be enabled later. A factory in `lib/ai/index.ts` reads `AI_PROVIDER` from the validated env (default `gemini`) and returns the configured instance. Swapping providers is a config change, not a refactor. Gemini supports the full interface — streaming, structured output (response schema), and embeddings — so no capability is lost by defaulting to it.

**Level 3 — Domain services (`lib/ai/services/`).** Each product loop gets a purpose-built service that composes a **versioned prompt** (`lib/ai/prompts/`), the provider, and a **typed output schema** — so the rest of the app calls `roadmapGenerator.generate(profile, target)` and gets back a validated `Roadmap`, never a raw string:

- `assessmentAnalyzer` — responses → structured career profile
- `careerAdvisor` — profile ↔ careers/opportunities match + rationale
- `roadmapGenerator` — profile + target → milestone roadmap
- `resumeAssistant` — content → suggestions/rewrites
- `interviewCoach` — role → questions, and answers → scored feedback (streamed)
- `mentorChat` — conversation + profile context → streamed reply

**Cross-cutting AI concerns.**
- **Structured output.** Feature-facing services return Zod-validated objects (`generateObject`), so malformed model output is caught at the boundary, not deep in a component.
- **Prompt management.** Prompts are versioned modules (optionally backed by `aiPrompts` for admin tuning), keeping them out of business logic and reviewable over time.
- **Guardrails (`guardrails.ts`).** Input sanitation, output moderation, and PII checks wrap every call.
- **Metering & rate limiting (`lib/usage`).** Token accounting per user/period enforces plan quotas and protects cost; checked before each call and recorded after.
- **Context assembly.** Mentor/interview services build context from the user's `careerProfile` and recent activity via repositories — the AI is always grounded in the user's real data.
- **Keys stay server-side.** All AI calls originate on the server; provider keys are never shipped to the browser.

> Implementation note: the streaming/adapter plumbing can be built on a lightweight streaming toolkit, but our own `AIProvider` interface and domain services remain the contract the app codes against — the toolkit is an implementation detail behind the adapter.

---

## 13. Cross-cutting concerns

- **State & data fetching.** Server Components fetch through repositories (no client data layer for server-rendered reads). Client interactivity uses React context for session/theme and a query cache (e.g. TanStack Query) for client-driven or realtime data; Firestore `onSnapshot` listeners power live mentor/notifications.
- **Forms & validation.** React Hook Form + Zod, with the **same** Zod schema validating on the client (UX) and again in the server action (trust). Schemas live in `features/*/schema.ts` and `lib/validation`.
- **Environment config (`lib/env.ts`).** All env vars parsed and validated with Zod at boot; the app refuses to start misconfigured. Clear split between `NEXT_PUBLIC_*` (safe for browser: Firebase web config) and server-only secrets (Admin SDK credentials, AI keys).
- **Error handling & observability.** Route-group `error.tsx` boundaries for UI; a normalized error envelope for APIs; structured server logging and an error-tracking integration (e.g. Sentry) for production.
- **Security.** httpOnly session cookies, Admin-SDK server authority, Firestore/Storage Security Rules, Zod at every boundary, per-user AI rate limits, least-privilege service credentials.
- **Testing.** Vitest for units (repositories and AI services tested against mocks/the Firebase emulator and a fake `AIProvider`); Playwright for critical e2e flows (sign-up → onboarding → first roadmap). The provider interface and repository pattern exist partly to make this mocking trivial.
- **Accessibility & performance.** Accessible primitives (focus management, ARIA, keyboard nav), server-first rendering, streaming for AI, image optimization, and route-level code splitting via the App Router.
- **Local development.** Firebase Emulator Suite (Auth + Firestore + Storage) so the whole stack runs offline without touching production data.

---

## 14. Development roadmap

The order is deliberate: **build the platform before the features, and build features in dependency order.** Foundations (auth, shell, data layer, AI layer) are shared by every loop, so they come first — otherwise each feature reinvents them. Then features ship one vertical slice at a time, each one demonstrable on its own. Hardening is continuous but gets a dedicated final pass.

Each phase lists its goal, what gets built, and why it's positioned here. Phases 0–2 and Phase 4 are platform work; **Phase 3 already puts a functional, personalized dashboard in front of the user**, so value appears the moment they log in.

### Phase 0 — Foundations & tooling
**Goal:** a configured, conventions-locked codebase.
Build: `lib/env.ts` (validated env), Firebase project + `firebase.json` + Emulator Suite, `lib/firebase/client.ts` & `admin.ts`, design tokens in `globals.css`, base UI primitives (`components/ui`), `providers/`, `config/nav.ts` & `routes.ts`, empty `error/loading/not-found`.
Why first: nothing can be built safely until env validation, Firebase init, and the primitive kit exist.

### Phase 1 — Authentication & accounts
**Goal:** users can sign up, sign in, and be trusted server-side.
Build: `(auth)` pages, `/api/auth/session`, `middleware.ts`, `AuthProvider`, `useAuth`, session-cookie mint/verify helpers, custom-claim roles, account bootstrap (create `users/{uid}` + `careerProfiles/{uid}` on sign-up).
Why here: every authenticated surface depends on a trusted session and a user document.

### Phase 2 — Data layer & repositories
**Goal:** a typed, secured persistence layer the dashboard and features read through.
Build: Firestore models in `types/`, `firestore.rules` + `firestore.indexes.json` + `storage.rules`, repositories in `lib/firebase/firestore/` (users/profiles first), and seed the `careers` + `skills` catalogs against the emulator.
Why here (moved up): the functional dashboard in Phase 3 needs typed, secured reads of the user and profile — so the data layer precedes the shell rather than following it.

### Phase 3 — App shell & functional dashboard  ← *first user-facing surface*
**Goal:** a working, personalized home the user lands on right after login.
Build: the `(app)` shell (sidebar + topbar, data-driven nav, protected routing, mobile drawer, command palette), plus a **functional** `/dashboard` that reads real user/profile data — welcome + profile snapshot, an onboarding call-to-action when the profile is incomplete, and next-best-action cards. Dashboard widgets are built as **slots** that later feature phases fill. Includes `/profile` and `/settings`.
Why here (moved up from the old Phase 12, per the approved change): users must see value as soon as they log in. The dashboard is genuinely functional from this phase and is then **progressively enriched** — each feature phase below contributes its own widget (active roadmap, recent interview, mentor prompt, …).

### Phase 4 — AI service layer
**Goal:** a callable, metered, provider-agnostic AI layer with **Gemini as the default**.
Build: `AIProvider` interface, the **Gemini adapter** + factory (`AI_PROVIDER` defaults to `gemini`), `lib/ai/prompts` and `services` scaffolding, `guardrails.ts`, `lib/usage` metering + rate limiting, and one thin test endpoint proving streaming and structured output end to end.
Why here: it's the last shared dependency before AI features. With Phases 0–4 done, every feature below is "compose existing building blocks."

### Phase 5 — Onboarding assessment  ← *first AI feature*
**Goal:** a new user completes an assessment and gets an AI career profile.
Build: `features/assessment` (stepper UI, `actions.ts`, schemas), the `assessmentAnalyzer` service, persistence to `assessments` + `careerProfiles`, the `onboardingComplete` gate, and the dashboard's onboarding widget switching over to the profile snapshot.
Why first among features: it produces the `careerProfile` that every later feature (matching, roadmaps, mentor context) consumes.

### Phase 6 — Career exploration
**Goal:** browse and understand careers, matched to the profile.
Build: `features/careers` (list/search/filter, detail pages), `careerAdvisor` match scoring against the profile, and a "recommended careers" dashboard widget.
Why here: turns the profile into value quickly and feeds target-role selection for roadmaps.

### Phase 7 — Learning roadmaps
**Goal:** generate and track a personalized roadmap toward a target role.
Build: `features/roadmap`, `roadmapGenerator` (structured output), milestone tracking UI, progress persistence, and an "active roadmap / progress" dashboard widget.
Why here: depends on both the profile (Phase 5) and a chosen target career (Phase 6).

### Phase 8 — Resume builder
**Goal:** AI-assisted resume creation, versioning, and export.
Build: `features/resume`, `resumeAssistant`, editor with inline suggestions, Storage-backed export (PDF), and a "resume status" dashboard widget.
Why here: independent of roadmaps; draws on profile/experience data already present.

### Phase 9 — AI mock interviews
**Goal:** practice interviews with streamed questions and scored feedback.
Build: `features/interview`, `interviewCoach`, `/api/ai/interview` streaming, session recording + scoring, and a "recent interview / score" dashboard widget.
Why here: exercises the streaming path in earnest; benefits from target-role context established earlier.

### Phase 10 — AI mentor chat
**Goal:** persistent, context-aware mentorship.
Build: `features/mentor`, `mentorChat`, `/api/ai/mentor` streaming, `conversations`/`messages` persistence, realtime message listeners, and a "continue with your mentor" dashboard widget.
Why here: the richest integration — it consumes profile, roadmap, and activity context, so it's most valuable once those exist.

### Phase 11 — Admin console
**Goal:** operate the platform.
Build: full `(admin)` — catalog management (careers/skills), user management, AI prompt versioning + usage dashboards.
Why here: grows as features land; formalized once the data it manages is stable.

### Phase 12 — Hardening & launch
**Goal:** production readiness.
Build: test coverage (Vitest units + Playwright e2e on the critical path), Security Rules audit, accessibility pass, performance budget, observability/error tracking, rate-limit tuning, CI/CD + deployment (e.g. Vercel + Firebase), and a pre-launch review.
Why last: hardening is continuous, but a dedicated final pass validates the whole system before launch.

### Deferred to V2 (post-MVP)
- **Opportunities module** — `features/opportunities`, the `opportunities` catalog and `savedOpportunities` subcollection, browse/detail, save flow, and match scoring (reusing `careerAdvisor`). Cut from the MVP to keep the first release focused on the core discover → plan → prepare → mentor journey.
- **Rich notifications** — a full in-app notification center and realtime nudges. The MVP dashboard covers "next actions" inline, so this can wait.

**Critical path (must be sequential):** 0 → 1 → 2 → 3 → 4 → 5. After Phase 5, features 6–10 can be reordered or parallelized by priority; Phase 11 (admin) and Phase 12 (hardening) close out the MVP. The Opportunities module and rich notifications follow in **V2**.

---

## 15. Assumptions & open decisions

These were assumed to complete the design; flag any you'd change:

1. **Auth providers** — email/password + Google + GitHub. Adjust to your audience (e.g. LinkedIn, Microsoft).
2. **Plans/billing** — a `free`/`pro` split is modeled in data, but no payment provider is chosen. If monetized early, insert billing (e.g. Stripe) around Phase 3–4.
3. **Resume export** — assumed PDF via a server render to Firebase Storage.
4. **AI default model** — Google Gemini via the Gemini adapter; the interface keeps Claude, OpenAI, and others open.
5. **Realtime scope** — used for mentor chat and notifications only; everything else is request/response.
6. **Hosting** — assumed Next.js on Vercel with Firebase as the backend; a fully Firebase-hosted variant (App Hosting) is also viable.

---

## 16. What I need from you

This is a design proposal, not code — **no UI or feature code has been generated.** Please review, in particular:

- the **product loops and page map** (§4–5) — is anything missing or mis-scoped?
- the **Firestore model** (§10) — collection boundaries and ownership;
- the **roadmap order** (§14) — priorities you'd resequence.

On your approval, I'll begin at **Phase 0 (Foundations & tooling)** and stop for review at the end of each phase.

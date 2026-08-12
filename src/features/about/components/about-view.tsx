import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import type { IconProps } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SparklesIcon,
  ArrowRightIcon,
  CompassIcon,
  TargetIcon,
  RouteIcon,
  FileTextIcon,
  RocketIcon,
  CheckCircleIcon,
  GlobeIcon,
} from "@/components/ui/icon";
import { MailIcon } from "@/components/ui/icons-extended";
import { ROUTES } from "@/config/routes";
import {
  HOW_IT_WORKS,
  FEATURES,
  STATS,
  VALUES,
  FAQS,
  type AboutItem,
} from "../config";
import { StatCounter } from "./stat-counter";
import { FaqAccordion } from "./faq-accordion";

/** Colored icon tile — reuses the dashboard's accent color-mix treatment. */
function AccentTile({
  icon: Icon,
  accentVar,
  size = 22,
  box = "h-11 w-11 rounded-xl",
}: {
  icon: ComponentType<IconProps>;
  accentVar: string;
  size?: number;
  box?: string;
}) {
  const accent = `var(${accentVar})`;
  return (
    <span
      className={`grid shrink-0 place-items-center ${box}`}
      style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
      aria-hidden="true"
    >
      <Icon size={size} />
    </span>
  );
}

function SectionHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      <h2 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-2 max-w-xl text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

/** Card used by "How it works" and "Core values". */
function IconCard({ item }: { item: AboutItem }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-background p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md sm:p-6">
      <AccentTile icon={item.icon} accentVar={item.accentVar} />
      <h3 className="mt-4 font-semibold tracking-tight">{item.title}</h3>
      <p className="mt-1.5 flex-1 text-sm text-muted">{item.description}</p>
    </div>
  );
}

function MissionPoint({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted">
      <CheckCircleIcon size={16} className="mt-0.5 shrink-0 text-primary" />
      {children}
    </li>
  );
}

function SocialLink({ label, href, children }: { label: string; href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="grid h-10 w-10 place-items-center rounded-lg border border-border text-muted transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
    >
      {children}
    </a>
  );
}

export function AboutView() {
  return (
    <div className="mx-auto max-w-5xl space-y-14 pb-6 animate-fade-up sm:space-y-20">
      {/* 1 — Hero */}
      <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <SparklesIcon size={14} />
              About CareerVerse
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">CareerVerse</h1>
            <p className="mt-2 text-base font-medium text-primary">
              Your AI-powered career companion.
            </p>
            <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">
              CareerVerse helps students and professionals discover the right careers, understand
              what it takes, and build a clear, personalized path to get there — powered by AI and
              grounded in real market data.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={ROUTES.careers}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <CompassIcon size={18} />
                Explore careers
              </Link>
              <Link
                href={ROUTES.assessment}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-5 text-sm font-medium text-muted transition-colors hover:bg-foreground/5"
              >
                Start Career Discovery
                <ArrowRightIcon size={16} />
              </Link>
            </div>
          </div>

          {/* Illustration placeholder — an on-brand cluster of accent icon tiles. */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4" aria-hidden="true">
            {[
              { icon: CompassIcon, accentVar: "--accent-assessment" },
              { icon: TargetIcon, accentVar: "--accent-mentor" },
              { icon: RouteIcon, accentVar: "--accent-roadmap" },
              { icon: FileTextIcon, accentVar: "--accent-resume" },
              { icon: SparklesIcon, accentVar: "--accent-interview" },
              { icon: RocketIcon, accentVar: "--accent-assessment" },
            ].map((tile, i) => (
              <div
                key={i}
                className="flex aspect-square items-center justify-center rounded-2xl border border-border bg-background/70 shadow-sm backdrop-blur transition-transform hover:-translate-y-0.5"
              >
                <AccentTile
                  icon={tile.icon}
                  accentVar={tile.accentVar}
                  size={26}
                  box="h-12 w-12 rounded-xl"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2 — Our Mission */}
      <section>
        <SectionHead eyebrow="Our mission" title="Career clarity for everyone" />
        <Card className="mt-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <p className="text-sm text-muted sm:text-base">
                Choosing a career is one of life&apos;s biggest decisions — yet most people make it
                with scattered advice and guesswork. CareerVerse exists to change that. We combine
                artificial intelligence with real, structured career data so every student and
                professional can <span className="font-medium text-foreground">discover</span> paths
                that fit them, <span className="font-medium text-foreground">plan</span> the skills
                to get there, and <span className="font-medium text-foreground">grow</span> with
                guidance that adapts as they do.
              </p>
              <p className="mt-3 text-sm text-muted sm:text-base">
                Whether you&apos;re just starting out or reinventing your path, CareerVerse turns
                uncertainty into a clear, confident next step.
              </p>
            </div>
            <ul className="space-y-2.5 rounded-2xl border border-border bg-surface p-5">
              <MissionPoint>Personalized to your interests, skills, and goals</MissionPoint>
              <MissionPoint>Grounded in real skills, salaries, and demand</MissionPoint>
              <MissionPoint>Actionable — every insight leads to a next step</MissionPoint>
              <MissionPoint>Built for students and working professionals alike</MissionPoint>
            </ul>
          </div>
        </Card>
      </section>

      {/* 3 — How CareerVerse works */}
      <section>
        <SectionHead
          eyebrow="How it works"
          title="From discovery to growth"
          subtitle="Four simple steps take you from “I don’t know where to start” to a clear, personal plan."
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item) => (
            <IconCard key={item.key} item={item} />
          ))}
        </div>
      </section>

      {/* 4 — Why choose CareerVerse */}
      <section>
        <SectionHead
          eyebrow="Why CareerVerse"
          title="Everything your career needs, together"
          subtitle="A complete toolkit — not a single feature — so your whole journey lives in one place."
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((item) => (
            <div
              key={item.key}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-background p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
            >
              <AccentTile icon={item.icon} accentVar={item.accentVar} />
              <div className="min-w-0">
                <h3 className="font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-1 text-sm text-muted">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5 — Platform highlights */}
      <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/[0.07] via-surface to-surface p-6 sm:p-10">
        <SectionHead
          eyebrow="Platform highlights"
          title="Trusted by a growing community"
          subtitle="Illustrative figures that reflect the scale CareerVerse is built for."
        />
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCounter
              key={stat.key}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              icon={<stat.icon size={22} />}
              accentVar={stat.accentVar}
            />
          ))}
        </div>
      </section>

      {/* 6 — Core values */}
      <section>
        <SectionHead
          eyebrow="Core values"
          title="What we stand for"
          subtitle="The principles behind every decision we make in CareerVerse."
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((item) => (
            <IconCard key={item.key} item={item} />
          ))}
        </div>
      </section>

      {/* 7 — Future vision */}
      <section>
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 text-center sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <RocketIcon size={28} />
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            The future of career guidance
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted sm:text-base">
            We&apos;re building CareerVerse into a lifelong AI career companion — one that grows with
            you from your first assessment to every role you&apos;ll ever hold. Imagine an advisor
            that understands your evolving strengths, surfaces opportunities before you go looking,
            connects learning to real outcomes, and is there at every crossroads. That&apos;s the
            future we&apos;re creating: personalized guidance, accessible to everyone, for every
            stage of the journey.
          </p>
          <div className="mt-6">
            <Link
              href={ROUTES.dashboard}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start your journey
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 8 — FAQ */}
      <section>
        <SectionHead
          eyebrow="FAQ"
          title="Frequently asked questions"
          subtitle="Everything you might want to know before getting started."
        />
        <div className="mx-auto mt-8 max-w-3xl">
          <FaqAccordion items={FAQS} />
        </div>
      </section>

      {/* 9 — Contact */}
      <section>
        <SectionHead eyebrow="Get in touch" title="We'd love to hear from you" />
        <Card className="mt-6 sm:p-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-4">
              <a
                href="mailto:careerverse.app@gmail.com"
                className="flex items-center gap-3 text-sm transition-colors hover:text-primary"
              >
                <AccentTile icon={MailIcon} accentVar="--accent-mentor" size={18} box="h-10 w-10 rounded-lg" />
                <span>
                  <span className="block text-xs text-subtle">Email</span>
                  careerverse.app@gmail.com
                </span>
              </a>
              <a
                href="https://careerverse.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm transition-colors hover:text-primary"
              >
                <AccentTile icon={GlobeIcon} accentVar="--accent-roadmap" size={18} box="h-10 w-10 rounded-lg" />
                <span>
                  <span className="block text-xs text-subtle">Website</span>
                  www.careerverse.app
                </span>
              </a>
            </div>

            <div className="flex flex-col justify-center gap-3">
              <p className="text-sm text-muted">Follow along as we build the future of career guidance.</p>
              <div className="flex gap-2">
                <SocialLink label="CareerVerse on X" href="https://x.com">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.9 2h3.3l-7.2 8.3L23.5 22h-6.6l-5.2-6.8L5.7 22H2.4l7.7-8.9L1.5 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.1 3.9H5.2L17.7 20Z" />
                  </svg>
                </SocialLink>
                <SocialLink label="CareerVerse on LinkedIn" href="https://linkedin.com">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3-.02-2.96-1.8-2.96-1.8 0-2.08 1.4-2.08 2.86V21H9V9Z" />
                  </svg>
                </SocialLink>
                <SocialLink label="CareerVerse on GitHub" href="https://github.com">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
                  </svg>
                </SocialLink>
                <SocialLink label="Email CareerVerse" href="mailto:careerverse.app@gmail.com">
                  <MailIcon size={18} />
                </SocialLink>
              </div>
              <Badge variant="muted" className="w-fit">
                Placeholder contact details
              </Badge>
            </div>
          </div>
        </Card>
      </section>

      {/* 10 — Creator */}
      <section>
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/[0.08] via-surface to-background p-8 text-center sm:p-10">
          <p className="text-sm text-muted">
            Created with <span className="text-danger" aria-label="love">❤️</span> by
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Umme Haany K</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Designer &amp; developer of CareerVerse — building the future of AI-powered career guidance.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <SocialLink label="GitHub" href="#">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
              </svg>
            </SocialLink>
            <SocialLink label="LinkedIn" href="#">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3-.02-2.96-1.8-2.96-1.8 0-2.08 1.4-2.08 2.86V21H9V9Z" />
              </svg>
            </SocialLink>
            <SocialLink label="Portfolio" href="#">
              <GlobeIcon size={18} />
            </SocialLink>
            <SocialLink label="Email" href="#">
              <MailIcon size={18} />
            </SocialLink>
          </div>
          <div className="mt-5 flex justify-center">
            <Badge variant="muted">Links coming soon</Badge>
          </div>
        </div>
      </section>
    </div>
  );
}

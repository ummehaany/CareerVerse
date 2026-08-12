/**
 * The CareerVerse email templates. Each builder returns an EmailContent
 * ({ subject, html, text }) assembled from the shared design-system blocks in
 * ./layout. Only quality-over-quantity, celebratory/mentor-style emails live
 * here — one per meaningful moment.
 */
import type { EmailContent } from "@/lib/email/types";
import {
  EMAIL_ACCENTS,
  emailAchievementCard,
  emailBullets,
  emailButton,
  emailCallout,
  emailHero,
  emailParagraph,
  emailProgress,
  emailSection,
  emailStatCards,
  esc,
  wrapEmail,
} from "@/lib/email/templates/layout";

export interface EmailLinks {
  /** Absolute app origin, e.g. https://careerverse.app (no trailing slash). */
  appUrl: string;
  /** Absolute URL to the notification preferences (Settings) page. */
  preferencesUrl: string;
}

function link(links: EmailLinks, path: string): string {
  return `${links.appUrl}${path}`;
}

function firstName(name?: string | null): string {
  const n = (name ?? "").trim();
  return n ? esc(n.split(/\s+/)[0]) : "there";
}

/* 1. 🎉 Welcome ─────────────────────────────────────────────────────────────*/
export function buildWelcomeEmail(data: { name?: string | null; links: EmailLinks }): EmailContent {
  const who = firstName(data.name);
  const accent = EMAIL_ACCENTS.assessment;
  const html = wrapEmail({
    preheader: "Welcome to CareerVerse — your future starts with one small step.",
    accent,
    preferencesUrl: data.links.preferencesUrl,
    content:
      emailHero({
        emoji: "🎉",
        title: "Welcome to CareerVerse",
        subtitle: "Experience your future before choosing it.",
        accent,
      }) +
      emailSection(
        emailParagraph(`Hi ${who}, we're thrilled you're here. CareerVerse is your AI mentor for discovering the right career, building the skills to get there, and staying motivated along the way.`) +
          emailParagraph("Here's a great way to start:") +
          emailBullets(
            [
              "Take the <strong>career assessment</strong> to unlock personalized recommendations",
              "Generate your <strong>learning roadmap</strong> and track real progress",
              "Practice with <strong>AI mock interviews</strong> and polish your resume",
            ],
            accent,
          ) +
          emailButton("Start your journey", link(data.links, "/dashboard"), accent) +
          emailParagraph("We'll only email you when it truly matters — a milestone, a win, or your weekly momentum. No noise.", { center: false }),
      ),
  });
  const text = `Welcome to CareerVerse, ${who}!

CareerVerse is your AI mentor for discovering the right career, building skills, and staying motivated.

Start here:
- Take the career assessment for personalized recommendations
- Generate your learning roadmap and track progress
- Practice AI mock interviews and polish your resume

Start your journey: ${link(data.links, "/dashboard")}

We only email you when it truly matters. Manage preferences: ${data.links.preferencesUrl}`;
  return { subject: "🎉 Welcome to CareerVerse — let's build your future", html, text };
}

/* 2. 🏆 Achievement Unlocked ────────────────────────────────────────────────*/
export function buildAchievementEmail(data: {
  name?: string | null;
  achievements: Array<{ emoji: string; title: string; description: string; accent?: string }>;
  links: EmailLinks;
}): EmailContent {
  const who = firstName(data.name);
  const accent = data.achievements[0]?.accent ?? EMAIL_ACCENTS.interview;
  const multiple = data.achievements.length > 1;
  const cards = data.achievements.map((a) => emailAchievementCard(a)).join("");
  const html = wrapEmail({
    preheader: multiple
      ? `You just unlocked ${data.achievements.length} new achievements!`
      : `Achievement unlocked: ${data.achievements[0]?.title ?? ""}`,
    accent,
    preferencesUrl: data.links.preferencesUrl,
    content:
      emailHero({
        emoji: "🏆",
        title: multiple ? "Achievements unlocked!" : "Achievement unlocked!",
        subtitle: `Nice work, ${who} — your effort is paying off.`,
        accent,
      }) +
      emailSection(
        cards +
          emailParagraph(multiple ? "Every badge is a real step toward your goal. Keep the momentum going." : "That's a real step toward your goal. Keep the momentum going.", { center: true }) +
          emailButton("View your achievements", link(data.links, "/achievements"), accent),
      ),
  });
  const list = data.achievements.map((a) => `- ${a.title}: ${a.description}`).join("\n");
  const text = `Achievement unlocked, ${who}!

${list}

View your achievements: ${link(data.links, "/achievements")}

Manage preferences: ${data.links.preferencesUrl}`;
  return {
    subject: multiple ? `🏆 You unlocked ${data.achievements.length} achievements!` : `🏆 Achievement unlocked: ${data.achievements[0]?.title ?? "New badge"}`,
    html,
    text,
  };
}

/* 3. 🗺️ Roadmap Ready ───────────────────────────────────────────────────────*/
export function buildRoadmapReadyEmail(data: {
  name?: string | null;
  careerTitle: string;
  stageCount: number;
  totalEstimatedTime: string;
  links: EmailLinks;
}): EmailContent {
  const who = firstName(data.name);
  const accent = EMAIL_ACCENTS.roadmap;
  const html = wrapEmail({
    preheader: `Your personalized roadmap to ${data.careerTitle} is ready.`,
    accent,
    preferencesUrl: data.links.preferencesUrl,
    content:
      emailHero({
        emoji: "🗺️",
        title: "Your roadmap is ready",
        subtitle: `A step-by-step path to becoming a ${esc(data.careerTitle)}.`,
        accent,
      }) +
      emailSection(
        emailParagraph(`Hi ${who}, we've mapped out a clear, personalized route to your goal — broken into stages with concrete milestones so you always know your next move.`) +
          emailStatCards([
            { label: "Career goal", value: data.careerTitle, accent },
            { label: "Stages", value: String(data.stageCount), accent },
            { label: "Est. time", value: data.totalEstimatedTime || "Flexible", accent },
          ]) +
          emailButton("Open your roadmap", link(data.links, "/roadmap"), accent) +
          emailParagraph("Tip: complete one milestone at a time. Small, consistent steps build unstoppable momentum.", { center: false }),
      ),
  });
  const text = `Your roadmap is ready, ${who}!

A personalized path to becoming a ${data.careerTitle}.
- Stages: ${data.stageCount}
- Estimated time: ${data.totalEstimatedTime || "Flexible"}

Open your roadmap: ${link(data.links, "/roadmap")}

Manage preferences: ${data.links.preferencesUrl}`;
  return { subject: `🗺️ Your roadmap to ${data.careerTitle} is ready`, html, text };
}

/* 4. 📄 Resume Milestone ────────────────────────────────────────────────────*/
export function buildResumeMilestoneEmail(data: {
  name?: string | null;
  milestoneTitle: string;
  milestoneBody: string;
  completion: number;
  atsScore?: number | null;
  links: EmailLinks;
}): EmailContent {
  const who = firstName(data.name);
  const accent = EMAIL_ACCENTS.resume;
  const stats: Array<{ label: string; value: string; accent?: string }> = [
    { label: "Resume complete", value: `${Math.round(data.completion)}%`, accent },
  ];
  if (typeof data.atsScore === "number") stats.push({ label: "ATS score", value: `${Math.round(data.atsScore)}`, accent });
  const html = wrapEmail({
    preheader: data.milestoneTitle,
    accent,
    preferencesUrl: data.links.preferencesUrl,
    content:
      emailHero({ emoji: "📄", title: data.milestoneTitle, subtitle: `Great progress, ${who}!`, accent }) +
      emailSection(
        emailParagraph(data.milestoneBody) +
          emailStatCards(stats) +
          emailProgress("Resume completeness", data.completion, accent) +
          emailButton("Refine your resume", link(data.links, "/resume"), accent) +
          emailParagraph("A strong, ATS-friendly resume gets you past the filters and in front of real people.", { center: false }),
      ),
  });
  const text = `${data.milestoneTitle}

${data.milestoneBody}

- Resume complete: ${Math.round(data.completion)}%${
    typeof data.atsScore === "number" ? `\n- ATS score: ${Math.round(data.atsScore)}` : ""
  }

Refine your resume: ${link(data.links, "/resume")}

Manage preferences: ${data.links.preferencesUrl}`;
  return { subject: `📄 ${data.milestoneTitle}`, html, text };
}

/* 5. 🎤 Interview Progress ──────────────────────────────────────────────────*/
export function buildInterviewProgressEmail(data: {
  name?: string | null;
  role: string;
  score: number;
  strength: string;
  improvement: string;
  links: EmailLinks;
}): EmailContent {
  const who = firstName(data.name);
  const accent = EMAIL_ACCENTS.interview;
  const html = wrapEmail({
    preheader: `Your mock interview feedback for ${data.role} is in.`,
    accent,
    preferencesUrl: data.links.preferencesUrl,
    content:
      emailHero({
        emoji: "🎤",
        title: "Interview progress",
        subtitle: `Nice effort on your ${esc(data.role)} mock interview, ${who}.`,
        accent,
      }) +
      emailSection(
        emailStatCards([{ label: "Your score", value: `${Math.round(data.score)}/100`, accent }]) +
          emailCallout({ emoji: "💪", title: "What you did well", body: esc(data.strength), accent: EMAIL_ACCENTS.roadmap }) +
          emailCallout({ emoji: "🎯", title: "One thing to sharpen", body: esc(data.improvement), accent }) +
          emailParagraph("Interviewing is a skill — and skills grow with reps. Ready for another round?", { center: true }) +
          emailButton("Practice again", link(data.links, "/interviews"), accent),
      ),
  });
  const text = `Interview progress, ${who}!

Role: ${data.role}
Score: ${Math.round(data.score)}/100

What you did well: ${data.strength}
One thing to sharpen: ${data.improvement}

Practice again: ${link(data.links, "/interviews")}

Manage preferences: ${data.links.preferencesUrl}`;
  return { subject: `🎤 Your ${data.role} interview feedback is ready`, html, text };
}

/* 6. 📊 Weekly Career Report ────────────────────────────────────────────────*/
export function buildWeeklyReportEmail(data: {
  name?: string | null;
  healthScore: number;
  streak: number;
  roadmapPercent: number;
  resumeCompletion: number;
  skillReadiness: number | null;
  interviewBest: number | null;
  recommendation: string;
  links: EmailLinks;
}): EmailContent {
  const who = firstName(data.name);
  const accent = EMAIL_ACCENTS.assessment;
  const stats: Array<{ label: string; value: string; accent?: string }> = [
    { label: "Career health", value: `${Math.round(data.healthScore)}%`, accent },
    { label: "Day streak", value: `${data.streak} 🔥`, accent: EMAIL_ACCENTS.interview },
    { label: "Roadmap done", value: `${Math.round(data.roadmapPercent)}%`, accent: EMAIL_ACCENTS.roadmap },
    { label: "Resume", value: `${Math.round(data.resumeCompletion)}%`, accent: EMAIL_ACCENTS.resume },
  ];
  if (typeof data.skillReadiness === "number")
    stats.push({ label: "Skill readiness", value: `${Math.round(data.skillReadiness)}%`, accent });
  if (typeof data.interviewBest === "number")
    stats.push({ label: "Best interview", value: `${Math.round(data.interviewBest)}`, accent: EMAIL_ACCENTS.interview });

  const html = wrapEmail({
    preheader: `Your weekly career momentum — health score ${Math.round(data.healthScore)}%.`,
    accent,
    preferencesUrl: data.links.preferencesUrl,
    content:
      emailHero({
        emoji: "📊",
        title: "Your weekly career report",
        subtitle: `Here's your momentum this week, ${who}.`,
        accent,
      }) +
      emailSection(
        emailProgress("Career Health Score", data.healthScore, accent) +
          emailStatCards(stats) +
          emailCallout({ emoji: "🚀", title: "Recommended next week", body: esc(data.recommendation), accent }) +
          emailButton("Open your dashboard", link(data.links, "/dashboard"), accent),
      ),
  });
  const text = `Your weekly career report, ${who}

Career Health Score: ${Math.round(data.healthScore)}%
Day streak: ${data.streak}
Roadmap done: ${Math.round(data.roadmapPercent)}%
Resume: ${Math.round(data.resumeCompletion)}%${
    typeof data.skillReadiness === "number" ? `\nSkill readiness: ${Math.round(data.skillReadiness)}%` : ""
  }${typeof data.interviewBest === "number" ? `\nBest interview: ${Math.round(data.interviewBest)}` : ""}

Recommended next week: ${data.recommendation}

Open your dashboard: ${link(data.links, "/dashboard")}

Manage preferences: ${data.links.preferencesUrl}`;
  return { subject: `📊 Your weekly career report — ${Math.round(data.healthScore)}% health score`, html, text };
}

/* 7. 🔥 Streak Reminder ─────────────────────────────────────────────────────*/
export function buildStreakReminderEmail(data: {
  name?: string | null;
  streak: number;
  links: EmailLinks;
}): EmailContent {
  const who = firstName(data.name);
  const accent = EMAIL_ACCENTS.interview;
  const html = wrapEmail({
    preheader: `Keep your ${data.streak}-day streak alive — a few minutes is all it takes.`,
    accent,
    preferencesUrl: data.links.preferencesUrl,
    content:
      emailHero({
        emoji: "🔥",
        title: `Your ${data.streak}-day streak is going strong`,
        subtitle: `A quick visit today keeps it alive, ${who}.`,
        accent,
      }) +
      emailSection(
        emailParagraph("Consistency is your superpower — even five focused minutes counts. Log a little progress today and keep the fire burning.", { center: true }) +
          emailButton("Keep my streak", link(data.links, "/dashboard"), accent) +
          emailParagraph("No pressure at all — you're doing great, and every step forward matters.", { center: true }),
      ),
  });
  const text = `Keep your ${data.streak}-day streak alive, ${who}!

Even five focused minutes counts. Log a little progress today.

Keep my streak: ${link(data.links, "/dashboard")}

Manage preferences: ${data.links.preferencesUrl}`;
  return { subject: `🔥 Keep your ${data.streak}-day streak alive`, html, text };
}

/* 8. ⭐ Pro Activated ───────────────────────────────────────────────────────*/
export function buildProActivatedEmail(data: { name?: string | null; links: EmailLinks }): EmailContent {
  const who = firstName(data.name);
  const accent = EMAIL_ACCENTS.mentor;
  const html = wrapEmail({
    preheader: "CareerVerse Pro is active — enjoy unlimited access.",
    accent,
    preferencesUrl: data.links.preferencesUrl,
    content:
      emailHero({
        emoji: "⭐",
        title: "CareerVerse Pro is active",
        subtitle: `Thank you for upgrading, ${who}!`,
        accent,
      }) +
      emailSection(
        emailParagraph("You've unlocked the full CareerVerse experience. Here's what's now yours:") +
          emailBullets(
            [
              "<strong>Unlimited</strong> AI career planning & insights",
              "<strong>Unlimited</strong> AI resume assistance",
              "<strong>Unlimited</strong> AI mock interviews",
              "Priority access to new features as they launch",
            ],
            accent,
          ) +
          emailButton("Explore Pro features", link(data.links, "/dashboard"), accent) +
          emailParagraph("We're honored to be part of your journey. Go build something remarkable.", { center: false }),
      ),
  });
  const text = `CareerVerse Pro is active — thank you, ${who}!

You've unlocked:
- Unlimited AI career planning & insights
- Unlimited AI resume assistance
- Unlimited AI mock interviews
- Priority access to new features

Explore Pro features: ${link(data.links, "/dashboard")}

Manage preferences: ${data.links.preferencesUrl}`;
  return { subject: "⭐ Welcome to CareerVerse Pro", html, text };
}

/* 9. 🎉 Career Discovery results ready ──────────────────────────────────────*/
export function buildAssessmentResultsEmail(data: {
  name?: string | null;
  topCareerTitle: string | null;
  links: EmailLinks;
}): EmailContent {
  const who = firstName(data.name);
  const accent = EMAIL_ACCENTS.assessment;
  const hasTop = Boolean(data.topCareerTitle);
  const subtitle = hasTop
    ? `Your top match: ${data.topCareerTitle}.`
    : "Your personalized career matches are ready to explore.";
  const html = wrapEmail({
    preheader: "Your Career Discovery results are ready to explore.",
    accent,
    preferencesUrl: data.links.preferencesUrl,
    content:
      emailHero({
        emoji: "🎉",
        title: "Your Career Discovery results are ready",
        subtitle,
        accent,
      }) +
      emailSection(
        emailParagraph(
          `Hi ${who}, you just completed Career Discovery — nice work. Based on your answers, we've matched you with careers that fit how you think and work, each with a plain-language explanation of why it's a fit.`,
        ) +
          emailCallout({
            emoji: "🧭",
            title: "What this is (and isn't)",
            body: "These matches are a starting point for exploring careers, not a scientific prediction or a guarantee — think of them as a well-informed nudge in a promising direction.",
            accent,
          }) +
          emailButton("View your results", link(data.links, "/assessment"), accent) +
          emailParagraph("Curious how you'd score on more careers? You can always refine your matches with a few more questions from your results page.", { center: false }),
      ),
  });
  const text = `Your Career Discovery results are ready, ${who}!

${hasTop ? `Your top match: ${data.topCareerTitle}.` : "Your personalized career matches are ready to explore."}

These matches are a starting point for exploring careers, not a scientific prediction or a guarantee.

View your results: ${link(data.links, "/assessment")}

Manage preferences: ${data.links.preferencesUrl}`;
  return { subject: "Your Career Discovery results are ready 🎉", html, text };
}

/* 10. 🧭 Career Discovery reminder (pending/incomplete) ────────────────────*/
export function buildAssessmentReminderEmail(data: { name?: string | null; links: EmailLinks }): EmailContent {
  const who = firstName(data.name);
  const accent = EMAIL_ACCENTS.assessment;
  const html = wrapEmail({
    preheader: "You haven't finished Career Discovery yet — it only takes a couple of minutes.",
    accent,
    preferencesUrl: data.links.preferencesUrl,
    content:
      emailHero({
        emoji: "🧭",
        title: "Your Career Discovery is waiting for you",
        subtitle: `Pick up right where you left off, ${who}.`,
        accent,
      }) +
      emailSection(
        emailParagraph(
          "You haven't completed your Career Discovery yet. Finish it to explore careers that may fit your interests and strengths — it only takes a couple of minutes.",
        ) +
          emailButton("Finish Career Discovery", link(data.links, "/assessment"), accent) +
          emailParagraph("No pressure — this is here whenever you're ready.", { center: false }),
      ),
  });
  const text = `Your Career Discovery is waiting for you, ${who}

You haven't completed your Career Discovery yet. Finish it to explore careers that may fit your interests and strengths.

Finish Career Discovery: ${link(data.links, "/assessment")}

Manage preferences: ${data.links.preferencesUrl}`;
  return { subject: "Your Career Discovery is waiting for you", html, text };
}

/* 11. ✅ Weekly task reminder ────────────────────────────────────────────────*/
export function buildWeeklyTaskReminderEmail(data: {
  name?: string | null;
  pendingTask: string;
  links: EmailLinks;
}): EmailContent {
  const who = firstName(data.name);
  const accent = EMAIL_ACCENTS.roadmap;
  const html = wrapEmail({
    preheader: `Pending this week: ${data.pendingTask}`,
    accent,
    preferencesUrl: data.links.preferencesUrl,
    content:
      emailHero({
        emoji: "✅",
        title: "You still have CareerVerse tasks to complete this week",
        subtitle: `A quick check-in, ${who} — you've been away for a bit.`,
        accent,
      }) +
      emailSection(
        emailCallout({ emoji: "📌", title: "Pending this week", body: esc(data.pendingTask), accent }) +
          emailParagraph("Even a few focused minutes keeps your momentum going — pick up wherever makes sense for you.") +
          emailButton("Go to my dashboard", link(data.links, "/dashboard"), accent),
      ),
  });
  const text = `You still have CareerVerse tasks to complete this week, ${who}

Pending this week: ${data.pendingTask}

Even a few focused minutes keeps your momentum going.

Go to my dashboard: ${link(data.links, "/dashboard")}

Manage preferences: ${data.links.preferencesUrl}`;
  return { subject: "You still have CareerVerse tasks to complete this week", html, text };
}

import { ROUTES } from "@/config/routes";
import { getSkillGapReadiness } from "@/features/skillgap/readiness";
import type { IntelSignals, NextBestAction, IntelligenceData } from "./types";

/** Weighted average of the meaningful readiness signals (0 filtered out). */
export function computeReadiness(s: IntelSignals): number {
  const parts = [s.skillReadiness, s.resumeCompletion, s.roadmapPercent, s.interviewBest, s.target?.readiness ?? null].filter(
    (n): n is number => typeof n === "number" && n > 0,
  );
  if (!parts.length) return 0;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

/**
 * Ranked next-best-actions. Each candidate carries a priority; the highest is
 * "today's highest-priority task". Conditions read from cross-module signals so
 * a change anywhere (finish a milestone, add a resume section, pick a target)
 * reshapes guidance everywhere.
 *
 * Progressive disclosure: until Career Discovery is complete, direction-
 * dependent actions (roadmap, skill-gap analysis, target-company prep,
 * interview prep) are withheld — they require a career direction Career
 * Discovery hasn't produced yet. Foundational actions (resume) and pure
 * exploration (browsing careers) stay available either way.
 */
export function computeNextActions(s: IntelSignals): NextBestAction[] {
  const out: NextBestAction[] = [];
  const add = (a: NextBestAction) => out.push(a);

  if (!s.onboardingComplete) {
    add({
      id: "assessment",
      context: "assessment",
      title: "Complete your career assessment to unlock personalized guidance.",
      detail: "Your assessment powers every match, roadmap, and interview plan.",
      href: ROUTES.assessment,
      cta: "Start assessment",
      icon: "compass",
      accentVar: "--accent-assessment",
      priority: 100,
    });
  }

  if (s.onboardingComplete && s.recommendationsCount === 0) {
    add({
      id: "matches",
      context: "recommendations",
      title: "Generate your career matches to see the roles that fit you best.",
      detail: "AI ranks careers against your assessment profile.",
      href: ROUTES.recommendations,
      cta: "See matches",
      icon: "target",
      accentVar: "--accent-mentor",
      priority: 90,
    });
  }

  if (!s.hasResume) {
    add({
      id: "resume-start",
      context: "resume",
      title: "Start your resume — even a first draft strengthens your profile.",
      detail: "An ATS-ready resume improves matches and readiness.",
      href: ROUTES.resume,
      cta: "Build resume",
      icon: "file",
      accentVar: "--accent-resume",
      priority: 70,
    });
  } else if (s.resumeCompletion < 80) {
    add({
      id: "resume-improve",
      context: "resume",
      title: "Updating your resume could improve your profile.",
      detail: `Your resume is ${s.resumeCompletion}% complete — a few sections away from strong.`,
      href: ROUTES.resume,
      cta: "Improve resume",
      icon: "file",
      accentVar: "--accent-resume",
      priority: 62,
    });
  }

  // Everything below requires a career direction that only Career Discovery
  // produces (target skills, roadmap, skill-gap-for-a-role, target-company
  // prep, interview prep). Withheld pre-Discovery per the progressive-
  // disclosure fix — Career Discovery itself and its matching are unchanged.
  if (s.onboardingComplete) {
    // The Roadmap page itself hard-requires at least one career match before
    // it will generate anything (features/roadmap/components/roadmap-view.tsx
    // — "Generate your career matches first"). Reusing that same signal here
    // so the dashboard never recommends a step the target page would refuse.
    const matchesExist = s.recommendationsCount > 0;

    // Canonical Skill Gap prerequisite (see features/skillgap/readiness.ts):
    // ready once Career Discovery has produced at least one career match, or
    // the student already has Skill Gap results. Reused here so the dashboard
    // never recommends Skill Gap analysis before the page itself would have
    // anything personalized to show.
    const skillGapReady =
      getSkillGapReadiness({
        onboardingComplete: s.onboardingComplete,
        recommendationsCount: s.recommendationsCount,
        hasHistory: s.skillReadiness !== null,
      }) !== "not-ready";

    if (skillGapReady && s.target && s.target.missingSkills.length > 0) {
      const skill = s.target.missingSkills[0];
      add({
        id: `target-skill:${skill}`,
        context: "skills",
        title: `Your ${skill} skill is below the requirement for ${s.target.name}.`,
        detail: `Close this gap to raise your ${s.target.name} readiness.`,
        href: ROUTES.skillGap,
        cta: "Analyze skills",
        icon: "puzzle",
        accentVar: "--accent-roadmap",
        priority: 82,
      });
    }

    if (s.interviewsCount === 0) {
      add({
        id: "interview-first",
        context: "interview",
        title: "Complete one mock interview to increase your readiness.",
        detail: "A single practice session sharpens answers and lifts your score.",
        href: ROUTES.interviews,
        cta: "Practice now",
        icon: "mic",
        accentVar: "--accent-interview",
        priority: 74,
      });
    }

    if (matchesExist && !s.roadmapExists) {
      add({
        id: "roadmap-generate",
        context: "roadmap",
        title: "Generate a learning roadmap to guide your next steps.",
        detail: "Turn your target role into a week-by-week plan.",
        href: ROUTES.roadmap,
        cta: "Build roadmap",
        icon: "route",
        accentVar: "--accent-roadmap",
        priority: 66,
      });
    } else if (s.roadmapExists && s.nextMilestone) {
      add({
        id: "roadmap-milestone",
        context: "roadmap",
        title: `Complete "${s.nextMilestone.title}" — your next roadmap milestone.`,
        detail: `In ${s.nextMilestone.stage}. Each milestone adds real readiness.`,
        href: ROUTES.roadmap,
        cta: "Continue roadmap",
        icon: "route",
        accentVar: "--accent-roadmap",
        priority: 52,
      });
    }

    if (skillGapReady) {
      if (s.skillReadiness === null) {
        add({
          id: "skills-first",
          context: "skills",
          title: "Run a skill gap analysis to see exactly where you stand.",
          detail: "Benchmark your skills against your target role.",
          href: ROUTES.skillGap,
          cta: "Analyze skills",
          icon: "puzzle",
          accentVar: "--accent-roadmap",
          priority: 56,
        });
      } else if (s.skillReadiness < 70) {
        add({
          id: "skills-close",
          context: "skills",
          title: "Close your top skill gaps to boost your readiness.",
          detail: `Your skill readiness is ${s.skillReadiness}% — targeted practice moves it fast.`,
          href: ROUTES.skillGap,
          cta: "View gaps",
          icon: "puzzle",
          accentVar: "--accent-roadmap",
          priority: 46,
        });
      }
    }

    if (!s.target) {
      add({
        id: "pick-target",
        context: "companies",
        title: "Pick a target company to personalize your preparation.",
        detail: "Get a company-specific readiness score, roadmap, and interview kit.",
        href: ROUTES.companies,
        cta: "Explore companies",
        icon: "rocket",
        accentVar: "--accent-assessment",
        priority: 42,
      });
    } else if (s.target.missingSkills.length === 0) {
      add({
        id: "target-polish",
        context: "companies",
        title: `You're on track for ${s.target.name} — keep polishing.`,
        detail: s.target.nextTask,
        href: `${ROUTES.companies}/${s.target.slug}`,
        cta: "Open company",
        icon: "rocket",
        accentVar: "--accent-assessment",
        priority: 40,
      });
    }

    if (s.interviewsCount > 0 && (s.interviewBest ?? 0) < 80) {
      add({
        id: "interview-improve",
        context: "interview",
        title: "Beat your best interview score to raise your readiness.",
        detail: `Your best is ${s.interviewBest ?? 0}/100 — another round can push it higher.`,
        href: ROUTES.interviews,
        cta: "Practice again",
        icon: "mic",
        accentVar: "--accent-interview",
        priority: 44,
      });
    }

    // Its href points into the roadmap, so — same as roadmap-generate above —
    // only offer it once matches exist; the "Generate your career matches"
    // recommendation already covers the momentum nudge before that.
    if (matchesExist) {
      add({
        id: "streak",
        context: "general",
        title: s.streak > 0 ? `Keep your ${s.streak}-day streak alive today.` : "Start a learning streak today.",
        detail: "Small, consistent steps compound into a career.",
        href: ROUTES.roadmap,
        cta: "Take a step",
        icon: "clock",
        accentVar: "--accent-roadmap",
        priority: 10,
      });
    }
  } else {
    // Pre-Discovery equivalent of the streak nudge: pure exploration, no
    // career direction required, and explicitly not a roadmap/company/skill
    // prompt.
    add({
      id: "explore-careers",
      context: "careers",
      title: "Not sure yet? Explore careers while you decide.",
      detail: "Browse roles across every field — no assessment required.",
      href: ROUTES.careers,
      cta: "Explore careers",
      icon: "compass",
      accentVar: "--accent-mentor",
      priority: 10,
    });
  }

  return out.sort((a, b) => b.priority - a.priority);
}

/** A concrete, prioritized resume suggestion. */
export function resumeSuggestion(s: IntelSignals): string {
  if (!s.hasResume) return "Start your resume — even a first draft boosts your profile.";
  if (!s.resumeSummary.trim()) return "Add a professional summary to your resume.";
  if (s.resumeExperienceCount === 0) return "Add work or project experience to your resume.";
  if (s.resumeProjectsCount === 0) return "Showcase at least one project on your resume.";
  if (s.resumeCompletion < 100) return `Round out your resume to 100% — it's at ${s.resumeCompletion}%.`;
  if (s.target) return `Tailor your resume to ${s.target.name}'s roles.`;
  return "Your resume is strong — tailor it to each application.";
}

/** An AI-style insight synthesized from the strongest current signal. */
export function recentInsight(s: IntelSignals, readiness: number, top: NextBestAction | null): string {
  const band = readiness >= 70 ? "strong momentum" : readiness >= 40 ? "steady progress" : "an early start";
  if (top) return `You're at ${readiness}% readiness with ${band}. Biggest lever right now: ${top.detail}`;
  return `You're at ${readiness}% readiness with ${band}. Keep building on what's working.`;
}

/** A concise weekly summary line tying modules together. */
export function weeklySummary(s: IntelSignals, readiness: number): string {
  const bits = [
    `${readiness}% career readiness`,
    `${s.streak}-day streak`,
    `${s.interviewsCount} interview${s.interviewsCount === 1 ? "" : "s"} practiced`,
    `resume ${s.resumeCompletion}% complete`,
  ];
  return `This week: ${bits.join(" · ")}.`;
}

/** Assemble the full intelligence payload from signals. */
export function assembleIntelligence(s: IntelSignals): IntelligenceData {
  const readiness = computeReadiness(s);
  const recommendations = computeNextActions(s);
  const priorityTask = recommendations[0] ?? null;
  return {
    readiness,
    onboardingComplete: s.onboardingComplete,
    hasProfileData: s.hasProfileData,
    priorityTask,
    // Skip index 0: it's already shown prominently as "Today's priority" in
    // the hero, so repeating it in "Recommended for you" would duplicate the
    // same CTA (most visibly the assessment prompt) across two surfaces.
    recommendations: recommendations.slice(1, 7),
    nextMilestone: s.nextMilestone,
    resumeSuggestion: resumeSuggestion(s),
    target: s.target,
    recentInsight: recentInsight(s, readiness, priorityTask),
    weeklySummary: weeklySummary(s, readiness),
  };
}

/** Pick the most relevant recommendation for a given module context. */
export function actionForContext(data: IntelligenceData, context: string): NextBestAction | null {
  const match = data.recommendations.find((a) => a.context === context);
  return match ?? data.priorityTask;
}

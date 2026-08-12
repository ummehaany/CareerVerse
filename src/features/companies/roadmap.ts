import type { CompanyProfile, CompanyRole } from "@/lib/companies/types";
import type { CompanyRoadmap, ReadinessResult } from "./types";

/*
 * Builds a personalized "How to become <role> at <company>" roadmap from the
 * readiness gap. Deterministic and client-safe — a real AI can later replace
 * buildCompanyRoadmap without any UI changes.
 */
export function buildCompanyRoadmap(
  profile: CompanyProfile,
  role: CompanyRole,
  readiness: ReadinessResult,
): CompanyRoadmap {
  const company = profile.record.name;
  const gaps = [...readiness.missing, ...readiness.improve];
  const focusSkills = (gaps.length ? gaps : role.requiredSkills).slice(0, 6);
  const certs = role.certifications.filter((c) => c && c !== "—");

  const steps = [
    {
      title: "Learning path",
      detail: `Close the skill gaps that matter most for a ${role.title} at ${company}.`,
      items: focusSkills.length
        ? focusSkills.map((s) => `Build working proficiency in ${s}`)
        : role.requiredSkills.map((s) => `Deepen ${s}`),
    },
    {
      title: "Projects",
      detail: "Prove your skills with portfolio-worthy, resume-ready projects.",
      items: [
        `A substantial ${role.family.toLowerCase()} project applying ${focusSkills[0] ?? role.requiredSkills[0] ?? "your core skills"}`,
        `An end-to-end project mirroring ${company}'s domain (${profile.record.industry})`,
        "One collaborative or open-source contribution",
      ],
    },
    {
      title: "Certifications",
      detail: "Optional but credibility-boosting for this role.",
      items: certs.length ? certs.map((c) => `Earn: ${c}`) : ["No certifications required — focus on projects and fundamentals"],
    },
    {
      title: "Interview preparation",
      detail: `Prepare for ${company}'s process: ${profile.record.interviewFocus.join(", ")}.`,
      items: [
        ...role.interviewTopics.map((t) => `Practice ${t}`),
        "Study the company's mission and recent products",
      ],
    },
    {
      title: "Coding & practice",
      detail: "Sharpen the fundamentals interviewers probe.",
      items: [
        "Solve 3–5 problems/week on data structures & algorithms",
        "Do timed mock problems under interview conditions",
        "Review one system-design topic per week",
      ],
    },
    {
      title: "Communication",
      detail: "Interviews reward clear thinking out loud.",
      items: [
        "Practice explaining your approach before coding",
        "Prepare 5–6 STAR behavioral stories",
        "Do 2–3 mock interviews for feedback",
      ],
    },
    {
      title: "Portfolio & resume improvements",
      detail: `Tailor your materials to ${company}.`,
      items: [
        `Feature projects relevant to ${role.title}`,
        `Mirror keywords from the role: ${role.requiredSkills.slice(0, 4).join(", ")}`,
        "Quantify impact with metrics and outcomes",
      ],
    },
  ];

  const timeline = [
    {
      phase: "Phase 1 — Foundations",
      timeframe: "Weeks 1–4",
      focus: "Close the most critical skill gaps and set up your practice routine.",
      milestones: [
        focusSkills[0] ? `Reach working proficiency in ${focusSkills[0]}` : "Solidify core fundamentals",
        "Establish a weekly coding-practice cadence",
        "Outline your first portfolio project",
      ],
    },
    {
      phase: "Phase 2 — Build & deepen",
      timeframe: "Weeks 5–10",
      focus: "Ship projects and broaden coverage across the role's skill set.",
      milestones: [
        "Complete a substantial portfolio project",
        focusSkills[1] ? `Add ${focusSkills[1]} to your toolkit` : "Broaden secondary skills",
        certs.length ? `Progress toward ${certs[0]}` : "Deepen system-design knowledge",
      ],
    },
    {
      phase: "Phase 3 — Interview readiness",
      timeframe: "Weeks 11–16",
      focus: `Convert preparation into offers at ${company}.`,
      milestones: [
        "Complete 3+ full mock interviews",
        `Tailor your resume and portfolio to ${company}`,
        "Apply and track your pipeline",
      ],
    },
  ];

  return {
    title: `How to become a ${role.title} at ${company}`,
    summary: readiness.gapSummary,
    steps,
    timeline,
  };
}

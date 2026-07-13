import type { Career } from "@/lib/careers/types";
import { LEARNING_CATALOG } from "@/features/learning/catalog";

// ── Skill Gap ──────────────────────────────────────────────────────────────

export interface SkillGapItem {
  skill: string;
  estWeeks: number;
  resource: { title: string; url: string } | null;
}

export interface SkillGapResult {
  have: string[];
  missing: SkillGapItem[];
  matchPercent: number;
}

function norm(value: string): string {
  return value.toLowerCase().trim();
}

function userHasSkill(userSkills: string[], careerSkill: string): boolean {
  const target = norm(careerSkill);
  return userSkills.some((u) => {
    const n = norm(u);
    return n === target || n.includes(target) || target.includes(n);
  });
}

function estWeeksFor(difficulty: number): number {
  // Quick heuristic: harder fields imply longer ramp per skill (2–6 weeks).
  return Math.max(2, 1 + difficulty);
}

function findResource(skill: string): { title: string; url: string } | null {
  const s = norm(skill);
  const match = LEARNING_CATALOG.find(
    (r) =>
      r.skills.some((k) => {
        const n = norm(k);
        return n === s || n.includes(s) || s.includes(n);
      }) ||
      norm(r.category).includes(s) ||
      s.includes(norm(r.category)),
  );
  return match ? { title: match.title, url: match.url } : null;
}

export function computeSkillGap(userSkills: string[], career: Career): SkillGapResult {
  const have: string[] = [];
  const missing: SkillGapItem[] = [];

  for (const skill of career.skills) {
    if (userHasSkill(userSkills, skill)) {
      have.push(skill);
    } else {
      missing.push({ skill, estWeeks: estWeeksFor(career.difficulty), resource: findResource(skill) });
    }
  }

  // Priority order: quickest wins first.
  missing.sort((a, b) => a.estWeeks - b.estWeeks);

  const total = career.skills.length;
  return { have, missing, matchPercent: total ? Math.round((have.length / total) * 100) : 0 };
}

// ── Career Simulator (educational projection) ────────────────────────────────

export interface SimYear {
  year: number;
  stage: string;
  salary: number;
  focus: string;
}

export function simulateCareer(career: Career): SimYear[] {
  const { min, max } = career.salary;
  const at = (ratio: number) => Math.round((min + (max - min) * ratio) / 1000) * 1000;
  const topSkills = career.skills.slice(0, 2).join(" and ");

  return [
    {
      year: 1,
      stage: "Entry level",
      salary: at(0.05),
      focus: `Build the foundations (${topSkills || "core skills"}) and complete your first hands-on projects.`,
    },
    {
      year: 3,
      stage: "Established",
      salary: at(0.4),
      focus: "Deliver work independently, deepen your expertise, and earn a recognized certification.",
    },
    {
      year: 5,
      stage: "Senior",
      salary: at(0.75),
      focus: "Lead projects, mentor others, and specialize in a high-value area of the field.",
    },
    {
      year: 10,
      stage: "Leadership / Expert",
      salary: at(1.0),
      focus: "Drive strategy in a leadership role, or become a recognized deep expert.",
    },
  ];
}

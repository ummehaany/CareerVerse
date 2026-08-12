import { LEARNING_CATALOG } from "@/features/learning/catalog";
import type {
  AnalyzedSkill,
  ActionStage,
  CategoryScore,
  GapAnalysis,
  Priority,
  SkillGapCareer,
  SkillRecommendation,
  UserSkillInput,
} from "./types";

/*
 * Deterministic Skill Gap analysis engine — the "AI-powered" analysis runs
 * fully offline so it always works. It is a pure function of (career, skills),
 * so a future AI API can slot in behind the same `analyzeSkillGap` signature
 * without touching any UI.
 */

export const SKILL_CATEGORIES = [
  "Core / Technical",
  "Tools & Tech",
  "Problem Solving",
  "Communication",
  "Leadership",
  "Domain",
] as const;

const CATEGORY_KEYWORDS: Array<{ category: string; words: string[] }> = [
  { category: "Communication", words: ["communication", "presentation", "writing", "storytelling", "stakeholder", "collaboration", "teamwork", "empathy", "negotiation", "customer"] },
  { category: "Leadership", words: ["leadership", "mentor", "management", "strategy", "ownership", "decision", "planning", "coordination"] },
  { category: "Problem Solving", words: ["problem", "analysis", "analytical", "critical", "debug", "troubleshoot", "judgment", "statistic", "math", "reasoning", "research"] },
  { category: "Tools & Tech", words: ["git", "cloud", "docker", "sql", "excel", "figma", "tool", "framework", "aws", "azure", "ci/cd", "testing", "spreadsheet", "software", "platform", "container"] },
  { category: "Domain", words: ["taxation", "audit", "anatomy", "law", "legal", "finance", "accounting", "clinical", "pharmac", "compliance", "policy", "medical", "regulatory"] },
];

export function categorizeSkill(skill: string): string {
  const s = skill.toLowerCase();
  for (const group of CATEGORY_KEYWORDS) {
    if (group.words.some((w) => s.includes(w))) return group.category;
  }
  return "Core / Technical";
}

function norm(value: string): string {
  return value.toLowerCase().trim();
}

function matchProficiency(userSkills: UserSkillInput[], required: string): UserSkillInput | null {
  const target = norm(required);
  for (const u of userSkills) {
    const n = norm(u.name);
    if (!n) continue;
    if (n === target || n.includes(target) || target.includes(n)) return u;
  }
  return null;
}

function estWeeksFor(difficulty: number, partial: boolean): number {
  const base = Math.max(2, 1 + difficulty);
  return partial ? Math.max(1, Math.round(base / 2)) : base;
}

function findResource(skill: string): { title: string; url: string } | null {
  const s = norm(skill);
  const match = LEARNING_CATALOG.find(
    (r) =>
      r.skillsCovered.some((k) => {
        const n = norm(k);
        return n === s || n.includes(s) || s.includes(n);
      }) ||
      norm(r.category).includes(s) ||
      s.includes(norm(r.category)),
  );
  return match ? { title: match.title, url: match.resourceUrl } : null;
}

function pickCertifications(skill: string, career: SkillGapCareer): string[] {
  const s = norm(skill);
  const related = career.certifications.filter((c) => norm(c).includes(s) || s.includes(norm(c)));
  if (related.length) return related.slice(0, 2);
  return career.certifications.slice(0, 2);
}

function projectsFor(skill: string): string[] {
  return [
    `Build a small project that applies ${skill} end to end.`,
    `Recreate a real-world feature or case using ${skill}.`,
  ];
}

export function analyzeSkillGap(career: SkillGapCareer, userSkills: UserSkillInput[]): GapAnalysis {
  const required = career.skills;
  const total = required.length;
  const criticalCount = Math.max(1, Math.ceil(total / 2));

  const analyzed: AnalyzedSkill[] = required.map((skill, index) => {
    const category = categorizeSkill(skill);
    const critical = index < criticalCount;
    const match = matchProficiency(userSkills, skill);
    let status: AnalyzedSkill["status"] = "missing";
    let score = 0;
    if (match) {
      if (match.proficiency === "beginner") {
        status = "partial";
        score = 50;
      } else {
        status = "mastered";
        score = 100;
      }
    }
    return { skill, status, category, critical, proficiency: match?.proficiency ?? null, score };
  });

  const mastered = analyzed.filter((s) => s.status === "mastered");
  const partial = analyzed.filter((s) => s.status === "partial");
  const missing = analyzed.filter((s) => s.status === "missing");

  // Weighted readiness — critical skills count double.
  const weightOf = (s: AnalyzedSkill) => (s.critical ? 2 : 1);
  const weightedSum = analyzed.reduce((sum, s) => sum + weightOf(s) * s.score, 0);
  const weightTotal = analyzed.reduce((sum, s) => sum + weightOf(s) * 100, 0);
  const readinessScore = weightTotal ? Math.round((weightedSum / weightTotal) * 100) : 0;

  // Category scores for the radar.
  const catMap = new Map<string, AnalyzedSkill[]>();
  for (const s of analyzed) {
    const arr = catMap.get(s.category) ?? [];
    arr.push(s);
    catMap.set(s.category, arr);
  }
  const categories: CategoryScore[] = SKILL_CATEGORIES.filter((c) => catMap.has(c)).map((category) => {
    const arr = catMap.get(category) ?? [];
    const score = arr.length ? Math.round(arr.reduce((sum, s) => sum + s.score, 0) / arr.length) : 0;
    return { category, score, total: arr.length, mastered: arr.filter((s) => s.status === "mastered").length };
  });

  // Recommendations — missing first (critical → high), then partial upgrades.
  const gapSkills = [...missing, ...partial];
  const recommendations: SkillRecommendation[] = gapSkills.map((s) => {
    const priority: Priority = s.status === "missing" ? (s.critical ? "Critical" : "High") : "Medium";
    return {
      skill: s.skill,
      priority,
      estWeeks: estWeeksFor(career.difficulty, s.status === "partial"),
      certifications: pickCertifications(s.skill, career),
      projects: projectsFor(s.skill),
      resource: findResource(s.skill),
    };
  });
  const priorityRank: Record<Priority, number> = { Critical: 0, High: 1, Medium: 2 };
  recommendations.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.estWeeks - b.estWeeks);

  // Action plan — three timed stages.
  const criticalMissing = missing.filter((s) => s.critical).map((s) => s.skill);
  const otherMissing = missing.filter((s) => !s.critical).map((s) => s.skill);
  const upgrades = partial.map((s) => s.skill);
  const actionPlan: ActionStage[] = [];
  if (criticalMissing.length)
    actionPlan.push({ title: "Close critical gaps", timeline: "Weeks 1–4", focus: "Master the must-have skills that unlock the role.", skills: criticalMissing });
  if (otherMissing.length)
    actionPlan.push({ title: "Build breadth", timeline: "Weeks 5–10", focus: "Round out the remaining required skills with projects.", skills: otherMissing });
  actionPlan.push({
    title: "Level up & build a portfolio",
    timeline: "Weeks 11–16",
    focus: upgrades.length
      ? "Deepen partially-developed skills and ship portfolio projects."
      : "Deepen your strongest skills and ship portfolio projects that prove them.",
    skills: upgrades.length ? upgrades : mastered.slice(0, 3).map((s) => s.skill),
  });

  return {
    careerSlug: career.slug,
    careerTitle: career.title,
    readinessScore,
    totalRequired: total,
    mastered,
    partial,
    missing,
    categories,
    recommendations,
    actionPlan,
  };
}

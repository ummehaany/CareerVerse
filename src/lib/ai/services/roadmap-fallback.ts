import type { StructuredProfile } from "@/types/assessment";
import type { Milestone, RoadmapStage, StageLevel } from "@/types/roadmap";
import type { Career } from "@/lib/careers/types";
import { getCareers } from "@/lib/careers/catalog";

/*
 * Offline, local roadmap builder. Produces a complete beginner → intermediate →
 * advanced roadmap from the career catalog so "Build Roadmap" always works even
 * when the AI provider is unavailable.
 */

export interface FallbackRoadmap {
  overview: string;
  totalEstimatedTime: string;
  stages: RoadmapStage[];
}

function findCareer(title: string): Career | null {
  const t = title.toLowerCase().trim();
  const all = getCareers();
  return (
    all.find((c) => c.title.toLowerCase() === t) ??
    all.find((c) => c.title.toLowerCase().includes(t) || t.includes(c.title.toLowerCase())) ??
    null
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

const LEVEL_LABEL: Record<StageLevel, string> = {
  beginner: "Foundational",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function buildStage(
  stageIndex: number,
  level: StageLevel,
  title: string,
  summary: string,
  estimatedTime: string,
  skills: string[],
  certifications: string[],
  includeCerts: boolean,
): RoadmapStage {
  const groups = skills.length ? chunk(skills, 2) : [[]];
  const milestones: Milestone[] = groups.slice(0, 3).map((group, milestoneIndex) => ({
    id: `s${stageIndex}m${milestoneIndex}`,
    title: group.length ? `Learn ${group.join(" & ")}` : `${LEVEL_LABEL[level]} essentials`,
    description: group.length
      ? `Get hands-on with ${group.join(" and ")} through guided practice and small projects.`
      : `Build core ${level}-level competency and habits for this role.`,
    skills: group,
    estimatedTime: "2–4 weeks",
    projects: group.length
      ? [
          {
            title: `${group[0]} practice project`,
            description: `Build a small project that applies ${group[0]} end to end to reinforce the concept.`,
          },
        ]
      : [],
    certifications: includeCerts && milestoneIndex === 0 ? certifications.slice(0, 2) : [],
    resources: [
      `Curated tutorials and documentation for ${group.length ? group.join(", ") : title}`,
      "Hands-on practice exercises and community forums",
    ],
  }));

  return { level, title, summary, estimatedTime, milestones };
}

export function buildFallbackRoadmap(careerTitle: string, profile: StructuredProfile): FallbackRoadmap {
  const career = findCareer(careerTitle);
  const skills = career?.skills ?? [];
  const certifications = career?.certifications ?? [];

  const known = new Set(
    [...(profile.technicalSkills ?? []), ...(profile.softSkills ?? [])].map((s) => s.toLowerCase()),
  );
  const headStart = skills.filter((s) => known.has(s.toLowerCase()));

  const third = Math.max(2, Math.ceil(skills.length / 3));
  const foundational = skills.slice(0, third);
  const intermediate = skills.slice(third, third * 2);
  const advanced = skills.slice(third * 2);

  const stages: RoadmapStage[] = [
    buildStage(
      0,
      "beginner",
      `Build the foundations for ${careerTitle}`,
      "Establish the core knowledge, tools, and habits this career is built on.",
      "1–3 months",
      foundational,
      certifications,
      true,
    ),
    buildStage(
      1,
      "intermediate",
      `Apply and deepen your ${careerTitle} skills`,
      "Work on realistic projects, deepen your expertise, and earn a recognized certification.",
      "3–6 months",
      intermediate,
      certifications,
      false,
    ),
    buildStage(
      2,
      "advanced",
      `Specialize and lead as a ${careerTitle}`,
      "Take on complex, high-value work, specialize, and build leadership and portfolio depth.",
      "6–12 months",
      advanced,
      certifications,
      false,
    ),
  ];

  const headStartNote = headStart.length
    ? ` You already have a head start in ${headStart.slice(0, 3).join(", ")}.`
    : "";

  return {
    overview:
      `A structured, stage-by-stage path toward becoming a ${careerTitle}.` +
      (career ? ` ${career.whatDoes}` : "") +
      ` Progress from fundamentals to advanced, specialized work.${headStartNote}`.trim(),
    totalEstimatedTime: "10–21 months (self-paced)",
    stages,
  };
}

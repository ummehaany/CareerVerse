import type { PlanSeed } from "../prompts/career-plan";
import type { CareerPlan, PlanProject, PlanRoadmapMonth, PlanWeek } from "@/features/career-coach/plan-types";

/*
 * Deterministic Career Planning fallback. Builds a complete, useful report from
 * the seed (careers-catalog data + the user's strengths/gaps) using curated
 * templates — so the engine returns instantly and reliably even without an AI
 * key or when the model is slow/unavailable. No chat, no follow-ups.
 */

function uniq(list: string[], cap = 20): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of list) {
    const t = (v ?? "").trim();
    if (!t) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= cap) break;
  }
  return out;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const DATA_HINTS = ["machine learning", "deep learning", "data", "statistics", "python", "ai", "ml", "analytics"];

function isDataCareer(seed: PlanSeed): boolean {
  const hay = `${seed.careerTitle} ${seed.category ?? ""} ${(seed.catalogSkills ?? []).join(" ")}`.toLowerCase();
  return DATA_HINTS.some((h) => hay.includes(h));
}

function toolsFor(seed: PlanSeed): string[] {
  const base = ["VS Code", "Git", "GitHub"];
  if (isDataCareer(seed)) return uniq([...base, "Jupyter Notebook", "Google Colab", "Kaggle", "Docker"]);
  return uniq([...base, "Docker", "Postman", "Figma", "Linux / Terminal"]);
}

function salaryFor(seed: PlanSeed): CareerPlan["salary"] {
  const note = "Salaries vary based on country, company, skills, and experience.";
  if (seed.salaryUsd) {
    const { min, max } = seed.salaryUsd;
    const mid = Math.round((min + max) / 2);
    const inr = (usd: number) => Math.round((usd * 83) / 100000); // ≈ ₹ LPA
    return {
      entry: `₹${inr(min)}–${inr(mid)} LPA (~$${Math.round(min / 1000)}k–$${Math.round(mid / 1000)}k)`,
      mid: `₹${inr(mid)}–${inr(Math.round((mid + max) / 2))} LPA (~$${Math.round(mid / 1000)}k–$${Math.round(((mid + max) / 2) / 1000)}k)`,
      senior: `₹${inr(max)}+ LPA (~$${Math.round(max / 1000)}k+)`,
      note,
    };
  }
  return {
    entry: "₹4–8 LPA (~$8k–15k)",
    mid: "₹10–20 LPA (~$18k–40k)",
    senior: "₹25+ LPA (~$45k+)",
    note,
  };
}

function roadmapFor(skills: string[]): PlanRoadmapMonth[] {
  const groups = chunk(skills.length ? skills : ["Foundations"], Math.max(1, Math.ceil(skills.length / 4)));
  const months: PlanRoadmapMonth[] = [];
  const labels = ["Foundations", "Core skills", "Applied skills", "Advanced skills"];
  for (let i = 0; i < 4; i += 1) {
    months.push({ month: i + 1, label: labels[i], focus: groups[i] ?? ["Reinforce earlier topics"] });
  }
  months.push({ month: 5, label: "Projects", focus: ["Build 2–3 portfolio projects", "Publish to GitHub"] });
  months.push({ month: 6, label: "Interview Preparation", focus: ["Mock interviews", "Resume polish", "Apply to roles"] });
  return months;
}

function projectsFor(seed: PlanSeed, skills: string[]): PlanProject[] {
  const s = (i: number) => skills[i % Math.max(1, skills.length)] ?? "Core skills";
  const title = seed.careerTitle;
  const defs: PlanProject[] = [
    { name: `${title} Starter Project`, difficulty: "Beginner", skills: uniq([s(0), s(1)], 4), description: `A small, guided project applying the fundamentals of ${title}.` },
    { name: "Real-World Mini App", difficulty: "Beginner", skills: uniq([s(1), s(2)], 4), description: "Recreate a familiar tool end to end to cement the basics." },
    { name: "Data-Driven Case Study", difficulty: "Intermediate", skills: uniq([s(2), s(3)], 4), description: "Solve a realistic problem with a clean, documented workflow." },
    { name: "Portfolio Capstone", difficulty: "Intermediate", skills: uniq([s(0), s(3)], 4), description: "A flagship project that shows depth and decision-making." },
    { name: "Open-Source Contribution", difficulty: "Advanced", skills: uniq([s(1), s(4)], 4), description: "Contribute a fix or feature to a real open-source project." },
    { name: "End-to-End Production Build", difficulty: "Advanced", skills: uniq([s(2), s(4)], 4), description: "Ship a complete, deployed project with tests and docs." },
  ];
  return defs;
}

function weeklyPlan(): PlanWeek[] {
  return [
    { week: 1, focus: "Set up tools, learn the fundamentals, and finish one tutorial." },
    { week: 2, focus: "Deepen core skills with daily practice problems." },
    { week: 3, focus: "Start your first small project; commit to GitHub daily." },
    { week: 4, focus: "Learn the next core skill and add it to your project." },
    { week: 5, focus: "Build a portfolio capstone project." },
    { week: 6, focus: "Write your resume and start a portfolio site." },
    { week: 7, focus: "Practice mock interviews and coding challenges." },
    { week: 8, focus: "Apply to roles and iterate on feedback — you're job-ready." },
  ];
}

export function buildFallbackPlan(seed: PlanSeed, personalized: boolean): CareerPlan {
  const title = seed.careerTitle;
  // Prioritise the user's gaps, then catalog skills, then strengths.
  const skills = uniq([...(seed.userGaps ?? []), ...(seed.catalogSkills ?? []), ...(seed.userStrengths ?? [])], 14);
  const skillList = skills.length ? skills : ["Fundamentals", "Problem solving", "Communication"];
  const data = isDataCareer(seed);
  const certs = uniq([...(seed.catalogCertifications ?? []), "Relevant vendor certification"], 6);

  return {
    careerTitle: title,
    overview: {
      what: `A ${title} builds and applies specialized skills to solve real problems in the ${seed.category ?? "field"}. It blends technical depth with practical delivery.`,
      suitableFor: `People who enjoy continuous learning, problem-solving, and turning ideas into working outcomes — a great fit if you like ${skillList.slice(0, 3).join(", ")}.`,
      responsibilities: [
        `Apply ${skillList[0] ?? "core skills"} to day-to-day work`,
        "Collaborate with a team to ship reliable outcomes",
        "Continuously learn new tools and techniques",
        "Communicate progress and decisions clearly",
      ],
    },
    skills: skillList,
    roadmap: roadmapFor(skillList),
    projects: projectsFor(seed, skillList),
    courses: {
      free: uniq([
        "NPTEL courses (India)",
        "freeCodeCamp",
        "Google / Microsoft Learn free tracks",
        "YouTube course playlists",
        data ? "Kaggle Learn" : "The Odin Project",
      ]),
      paid: uniq([
        "Coursera Specializations",
        "Udemy career tracks",
        data ? "DataCamp" : "Frontend Masters",
        seed.topCompanies?.length ? `${seed.topCompanies[0]}-relevant certification` : "Vendor certification (AWS / Google / Microsoft)",
      ]),
    },
    resources: {
      books: [`A well-reviewed ${title} handbook`, "A fundamentals-first textbook", "An interview-prep book"],
      documentation: ["Official docs for your core tools", "MDN / language reference where relevant"],
      youtube: ["Reputable course channels", "Project-based build-along channels"],
      practice: [data ? "Kaggle" : "LeetCode", "HackerRank", "Real projects on GitHub"],
    },
    salary: salaryFor(seed),
    tools: toolsFor(seed),
    interviewPrep: {
      technicalTopics: uniq([...skillList.slice(0, 6), "Fundamentals", data ? "Machine Learning concepts" : "System Design"]),
      hrQuestions: [
        "Tell me about yourself.",
        "Why this role and why now?",
        "Describe a challenge you overcame.",
        "Where do you see yourself in 3 years?",
      ],
      coding: ["Data structures & algorithms", "Problem-solving patterns", "Timed coding practice"],
      aptitude: ["Quantitative aptitude", "Logical reasoning", "Verbal ability"],
    },
    resumeTips: {
      skillsToHighlight: skillList.slice(0, 8),
      projectsToInclude: ["Your capstone project", "One end-to-end build", "An open-source contribution"],
      certifications: certs,
      portfolio: ["A clean portfolio site", "Pinned GitHub projects with READMEs", "A short project demo video"],
    },
    weeklyPlan: weeklyPlan(),
    source: "curated",
    personalized,
  };
}

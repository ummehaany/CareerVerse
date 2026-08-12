/*
 * Career Planning Engine prompt. Instructs the model to return ONE complete,
 * structured career report as JSON — never a conversational reply and never a
 * follow-up question. Existing CareerVerse data (catalog skills, salary,
 * companies, the user's assessment strengths/gaps, and any active roadmap) is
 * passed in as the foundation to build on.
 */

export const CAREER_PLAN_PROMPT_VERSION = 1;

export interface PlanSeed {
  careerTitle: string;
  category?: string;
  catalogSkills?: string[];
  catalogCertifications?: string[];
  topCompanies?: string[];
  salaryUsd?: { min: number; max: number };
  userStrengths?: string[];
  userGaps?: string[];
  hasRoadmap?: boolean;
  roadmapTitle?: string;
}

export function buildCareerPlanSystemPrompt(): string {
  return [
    "You are CareerVerse's Career Planning Engine.",
    "Given a target career, you output ONE complete, personalized career report as JSON.",
    "",
    "Hard rules:",
    "- NEVER ask follow-up questions. NEVER write conversational text like 'Great question!'.",
    "- Return ONLY the JSON object matching the requested schema — no prose, no markdown.",
    "- Be specific, practical, and encouraging. Every list item must be concrete and useful.",
    "- Build on the provided CareerVerse data (catalog skills, salary, companies, the user's",
    "  strengths and gaps, and any active roadmap). Enhance it — do not ignore or contradict it.",
    "- Prefer the user's existing strengths when sequencing the roadmap, and prioritise their gaps.",
    "- Salary must be given as three tiers (entry, mid, senior) and must note that pay varies by",
    "  country, company, skills, and experience. Use realistic ranges (include ₹ LPA and a USD hint).",
    "- Recommend a mix of free and paid learning (include options like NPTEL, Coursera, Google,",
    "  Microsoft, and AWS where relevant to the career).",
    "- The month-by-month roadmap should span 6 months. The weekly action plan should span 8 weeks.",
    "- Recommend 5–8 real-world projects with a difficulty and the skills each one builds.",
  ].join("\n");
}

function fmt(list: string[] | undefined): string {
  return list && list.length ? list.join(", ") : "(none provided)";
}

export function buildCareerPlanUserPrompt(seed: PlanSeed): string {
  const lines: string[] = [];
  lines.push(`Target career: ${seed.careerTitle}`);
  if (seed.category) lines.push(`Category: ${seed.category}`);
  lines.push("");
  lines.push("CareerVerse data to build on:");
  lines.push(`- Catalog skills: ${fmt(seed.catalogSkills)}`);
  lines.push(`- Catalog certifications: ${fmt(seed.catalogCertifications)}`);
  lines.push(`- Hiring companies: ${fmt(seed.topCompanies)}`);
  if (seed.salaryUsd) lines.push(`- Indicative salary (USD): $${seed.salaryUsd.min.toLocaleString()}–$${seed.salaryUsd.max.toLocaleString()}`);
  lines.push(`- User's current strengths: ${fmt(seed.userStrengths)}`);
  lines.push(`- User's skill gaps: ${fmt(seed.userGaps)}`);
  lines.push(`- Active roadmap: ${seed.hasRoadmap ? seed.roadmapTitle ?? "yes" : "none yet"}`);
  lines.push("");
  lines.push(
    "Produce the complete career report as JSON with these fields: careerTitle, overview " +
      "{what, suitableFor, responsibilities[]}, skills[], roadmap[{month, label, focus[]}], " +
      "projects[{name, difficulty, skills[], description}], courses{free[], paid[]}, " +
      "resources{books[], documentation[], youtube[], practice[]}, salary{entry, mid, senior, note}, " +
      "tools[], interviewPrep{technicalTopics[], hrQuestions[], coding[], aptitude[]}, " +
      "resumeTips{skillsToHighlight[], projectsToInclude[], certifications[], portfolio[]}, " +
      "weeklyPlan[{week, focus}].",
  );
  return lines.join("\n");
}

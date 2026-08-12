import type { CompanyProfile, CompanyRole } from "@/lib/companies/types";
import type { ResumeMatchResult, UserSnapshot } from "./types";

/*
 * Compares the user's resume against a company role. Deterministic and
 * client-safe. Produces a match %, matched/missing keywords, ATS and
 * formatting suggestions, and gap flags for projects/achievements.
 */

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9+#. ]/g, " ").replace(/\s+/g, " ").trim();
}

function present(keyword: string, haystack: string[]): boolean {
  const k = norm(keyword);
  if (!k) return false;
  return haystack.some((h) => {
    const n = norm(h);
    return n === k || n.includes(k) || k.includes(n);
  });
}

export function matchResume(
  user: UserSnapshot,
  profile: CompanyProfile,
  role: CompanyRole,
): ResumeMatchResult {
  const keywords = Array.from(
    new Set([...role.requiredSkills, ...role.preferredSkills, ...profile.record.interviewFocus]),
  );

  const summaryTokens = user.resumeSummary ? user.resumeSummary.split(/\s+/) : [];
  const haystack = [...user.resumeSkills, ...summaryTokens];

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  for (const kw of keywords) {
    if (present(kw, haystack)) matchedKeywords.push(kw);
    else missingKeywords.push(kw);
  }

  if (!user.hasResume) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: keywords,
      atsSuggestions: [
        "Create a resume in the Resume Builder to unlock the match analysis",
        "Use a clean, single-column, ATS-friendly template",
        `Mirror keywords from the ${role.title} role`,
      ],
      formatting: [
        "Use standard section headings (Experience, Projects, Skills, Education)",
        "Save and submit as PDF unless a specific format is requested",
      ],
      missingProjects: true,
      missingAchievements: true,
      hasResume: false,
    };
  }

  const coverage = matchedKeywords.length / Math.max(1, keywords.length);
  const score = Math.round(Math.max(5, Math.min(98, coverage * 80 + user.resumeCompletion * 0.2)));

  const missingProjects = user.resumeProjectsCount === 0;
  const missingAchievements = user.resumeExperienceCount === 0 && user.resumeCertsCount === 0;

  const atsSuggestions = [
    missingKeywords.length
      ? `Add missing keywords where truthful: ${missingKeywords.slice(0, 6).join(", ")}`
      : "Great keyword coverage — keep phrasing natural and honest",
    "Match the exact role title in your headline",
    "Lead bullet points with strong action verbs and quantified impact",
    "Keep it to 1 page (early career) with consistent tense",
  ];

  const formatting = [
    "Use a clean, single-column, ATS-parseable layout",
    "Avoid tables, text boxes, and images for critical content",
    "Use standard section headings and a common font",
    "Export as PDF with selectable text",
  ];

  return {
    score,
    matchedKeywords,
    missingKeywords,
    atsSuggestions,
    formatting,
    missingProjects,
    missingAchievements,
    hasResume: true,
  };
}

/**
 * Public profile configuration: visibility levels, toggleable sections, and
 * share-link builders. Centralized so the public route, settings panel, and
 * share bar all agree.
 */

export type ProfileVisibility = "private" | "unlisted" | "public";

export const PROFILE_VISIBILITIES: { value: ProfileVisibility; label: string; description: string }[] = [
  { value: "private", label: "Private", description: "Only you can view it." },
  { value: "unlisted", label: "Unlisted", description: "Anyone with the link can view. Not indexed by search engines." },
  { value: "public", label: "Public", description: "Visible to everyone and eligible for search engines." },
];

/** Sections a user can individually show/hide on their public profile. */
export type PublicSection =
  | "healthScore"
  | "aiSummary"
  | "skills"
  | "projects"
  | "resume"
  | "timeline"
  | "certifications"
  | "interview"
  | "roadmap"
  | "targetCompanies"
  | "achievements";

export const PUBLIC_SECTIONS: { key: PublicSection; label: string }[] = [
  { key: "aiSummary", label: "AI career summary" },
  { key: "healthScore", label: "Career Health Score" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "resume", label: "Resume" },
  { key: "timeline", label: "Career timeline" },
  { key: "certifications", label: "Certifications" },
  { key: "interview", label: "Interview performance" },
  { key: "roadmap", label: "Roadmap progress" },
  { key: "targetCompanies", label: "Target companies" },
  { key: "achievements", label: "Achievements" },
];

export function defaultProfileSections(): Record<PublicSection, boolean> {
  return {
    healthScore: true,
    aiSummary: true,
    skills: true,
    projects: true,
    resume: true,
    timeline: true,
    certifications: true,
    interview: true,
    roadmap: true,
    targetCompanies: true,
    achievements: true,
  };
}

export function normalizeProfileSections(
  stored: Partial<Record<PublicSection, boolean>> | undefined | null,
): Record<PublicSection, boolean> {
  const base = defaultProfileSections();
  if (stored) {
    for (const { key } of PUBLIC_SECTIONS) {
      if (typeof stored[key] === "boolean") base[key] = stored[key] as boolean;
    }
  }
  return base;
}

export interface ShareLinks {
  linkedin: string;
  twitter: string;
  whatsapp: string;
  email: string;
}

/** Build social share deep-links for a profile URL. */
export function buildShareLinks(url: string, name: string): ShareLinks {
  const u = encodeURIComponent(url);
  const text = encodeURIComponent(`Check out ${name}'s CareerVerse profile`);
  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    twitter: `https://twitter.com/intent/tweet?url=${u}&text=${text}`,
    whatsapp: `https://wa.me/?text=${text}%20${u}`,
    email: `mailto:?subject=${text}&body=${text}%0A%0A${u}`,
  };
}

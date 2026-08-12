import type { User } from "@/types/user";
import type { StructuredProfile } from "@/types/assessment";
import type { ResumeDoc } from "@/types/resume";
import type {
  Portfolio,
  PortfolioEducation,
  PortfolioSkill,
} from "@/types/portfolio";

/** A blank portfolio — the starting point before any seeding or editing. */
export function emptyPortfolio(): Portfolio {
  return {
    personal: {
      fullName: "",
      headline: "",
      photoUrl: "",
      bio: "",
      careerGoal: "",
      location: "",
      email: "",
      phone: "",
    },
    education: [],
    technicalSkills: [],
    softSkills: [],
    projects: [],
    certifications: [],
    achievements: [],
    careerGoals: {
      dreamJob: "",
      targetCompany: "",
      targetSalary: "",
      workMode: "",
    },
    social: { linkedin: "", github: "", website: "", twitter: "" },
  };
}

function toSkills(names: string[] | undefined, level: PortfolioSkill["level"]): PortfolioSkill[] {
  const seen = new Set<string>();
  const out: PortfolioSkill[] = [];
  for (const raw of names ?? []) {
    const name = raw.trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    out.push({ name, level });
  }
  return out;
}

interface SeedSources {
  user: Pick<User, "displayName" | "email" | "photoURL"> | null;
  structured: StructuredProfile | null;
  resume: ResumeDoc | null;
}

/**
 * Build a realistic starter portfolio from the data the user already has —
 * their account, assessment profile, and primary resume. This is the
 * "placeholder data where backend functionality is unavailable" path: nothing
 * is invented, everything traces back to a real source and stays fully editable.
 */
export function seedPortfolio({ user, structured, resume }: SeedSources): Portfolio {
  const base = emptyPortfolio();
  const contact = resume?.contact;

  base.personal = {
    fullName: user?.displayName || contact?.fullName || "",
    headline: contact?.headline || structured?.goals.targetRoles?.[0] || "",
    photoUrl: user?.photoURL || contact?.photo || "",
    bio: structured?.goals.aspiration || resume?.summary || "",
    careerGoal:
      structured?.goals.aspiration || structured?.goals.targetRoles?.[0] || "",
    location: contact?.location || "",
    email: user?.email || contact?.email || "",
    phone: contact?.phone || "",
  };

  const education: PortfolioEducation[] = [];
  if (resume?.education?.length) {
    resume.education.forEach((e, i) => {
      education.push({
        id: `seed-edu-${i}`,
        school: e.school || "",
        degree: e.degree || "",
        field: "",
        startYear: e.startDate || "",
        endYear: e.endDate || "",
      });
    });
  } else if (structured?.education?.level || structured?.education?.field) {
    education.push({
      id: "seed-edu-0",
      school: "",
      degree: structured.education.level || "",
      field: structured.education.field || "",
      startYear: "",
      endYear: structured.education.status || "",
    });
  }
  base.education = education;

  base.technicalSkills = toSkills(
    structured?.technicalSkills?.length ? structured.technicalSkills : resume?.skills,
    "intermediate",
  );
  base.softSkills = toSkills(structured?.softSkills, "intermediate");

  if (resume?.projects?.length) {
    base.projects = resume.projects.map((p, i) => ({
      id: `seed-proj-${i}`,
      name: p.name || "",
      description: p.description || "",
      technologies: [],
      githubUrl: "",
      demoUrl: p.link || "",
    }));
  }

  if (resume?.certifications?.length) {
    base.certifications = resume.certifications.map((c, i) => ({
      id: `seed-cert-${i}`,
      name: c.name || "",
      issuer: c.issuer || "",
      issueDate: c.year || "",
      credentialUrl: "",
    }));
  }

  base.careerGoals.dreamJob = structured?.goals.targetRoles?.[0] || "";

  base.social = {
    linkedin: contact?.linkedin || "",
    github: contact?.github || "",
    website: contact?.website || "",
    twitter: "",
  };

  return base;
}

/** Strip a persisted PortfolioDoc down to the editable, serializable content. */
export function toEditable(doc: {
  personal: Portfolio["personal"];
  education: Portfolio["education"];
  technicalSkills: Portfolio["technicalSkills"];
  softSkills: Portfolio["softSkills"];
  projects: Portfolio["projects"];
  certifications: Portfolio["certifications"];
  achievements: Portfolio["achievements"];
  careerGoals: Portfolio["careerGoals"];
  social: Portfolio["social"];
}): Portfolio {
  const empty = emptyPortfolio();
  return {
    personal: { ...empty.personal, ...doc.personal },
    education: doc.education ?? [],
    technicalSkills: doc.technicalSkills ?? [],
    softSkills: doc.softSkills ?? [],
    projects: doc.projects ?? [],
    certifications: doc.certifications ?? [],
    achievements: doc.achievements ?? [],
    careerGoals: { ...empty.careerGoals, ...doc.careerGoals },
    social: { ...empty.social, ...doc.social },
  };
}

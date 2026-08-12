import type {
  CompanyProfile,
  CompanyRecord,
  CompanyRole,
  CompanyTier,
  GraduateProgram,
  HiringStage,
  InternshipProgram,
  TimelinePhase,
} from "./types";
import { ROLE_LIBRARY, rolesForTier } from "./roles";

/*
 * buildCompanyProfile expands a compact CompanyRecord into the full profile the
 * UI renders. Narrative sections come from tier-based defaults so every company
 * — including ones added later — gets a complete, realistic page for free.
 */

function isTech(tier: CompanyTier): boolean {
  return tier === "faang" || tier === "bigtech" || tier === "startup";
}

function round(n: number): number {
  return Math.max(1, Math.round(n));
}

function resolveRoles(record: CompanyRecord): CompanyRole[] {
  const keys = Array.from(
    new Set([...rolesForTier(record.tier), ...(record.extraRoleKeys ?? [])]),
  );
  return keys
    .map((key) => ROLE_LIBRARY[key])
    .filter((t): t is (typeof ROLE_LIBRARY)[string] => Boolean(t))
    .map((t) => {
      const min = round(t.baseSalaryLpa[0] * record.salaryFactor);
      const max = round(t.baseSalaryLpa[1] * record.salaryFactor);
      return {
        key: t.key,
        title: t.title,
        family: t.family,
        description: t.description,
        requiredSkills: t.requiredSkills,
        preferredSkills: t.preferredSkills,
        education: t.education,
        certifications: t.certifications,
        experience: t.experience,
        interviewTopics: t.interviewTopics,
        progression: t.progression,
        salaryLpa: [min, max] as [number, number],
        salaryLabel: `₹${min}–${max} LPA`,
      };
    });
}

function hiringProcess(tier: CompanyTier): HiringStage[] {
  if (isTech(tier)) {
    return [
      { stage: "Application / Referral", detail: "Apply online or through a referral; your resume is screened against the role bar." },
      { stage: "Recruiter screen", detail: "A 30-minute call covering your background, motivation, and logistics." },
      { stage: "Technical phone screen", detail: "One or two coding rounds focused on data structures and algorithms." },
      { stage: "Onsite / virtual loop", detail: "Four to five rounds spanning coding, system design, and behavioral." },
      { stage: "Hiring committee & offer", detail: "Feedback is reviewed by a committee, followed by team match and an offer." },
    ];
  }
  if (tier === "finance") {
    return [
      { stage: "Application / Online assessment", detail: "Apply and complete a timed coding and aptitude assessment." },
      { stage: "Technical rounds", detail: "One or two coding and CS-fundamentals interviews." },
      { stage: "Superday", detail: "Several back-to-back technical and behavioral interviews." },
      { stage: "Decision & offer", detail: "Panel review, HR discussion, and offer." },
    ];
  }
  // consulting + itservices
  return [
    { stage: "Application & aptitude test", detail: "Online test covering quantitative, logical, verbal, and basic coding." },
    { stage: "Technical interview", detail: "Fundamentals, projects, and role-specific problem solving." },
    { stage: "Managerial / communication round", detail: "Scenario, communication, and role-fit assessment." },
    { stage: "HR interview & offer", detail: "Culture fit, expectations, and the final offer." },
  ];
}

function eligibility(tier: CompanyTier): string[] {
  if (isTech(tier)) {
    return [
      "Bachelor's/Master's in CS or a related field — or equivalent demonstrable skills",
      "Strong problem-solving and coding ability",
      "Projects or internships that show real impact",
      "Skills valued over pedigree — no rigid academic cutoff",
    ];
  }
  if (tier === "finance") {
    return [
      "Bachelor's/Master's in CS, engineering, or a quantitative field",
      "Strong coding and analytical ability",
      "Solid academic record (typically 60%+ / strong GPA)",
      "Interest in financial markets is a plus",
    ];
  }
  return [
    "Bachelor's/Master's (B.E./B.Tech/MCA/M.Sc or equivalent)",
    "Typically 60%+ throughout academics (varies by role and year)",
    "No active backlogs at the time of joining",
    "Good communication skills",
  ];
}

function hiringTimeline(tier: CompanyTier): TimelinePhase[] {
  if (isTech(tier)) {
    return [
      { phase: "Application review", duration: "1–2 weeks" },
      { phase: "Interview loop", duration: "2–4 weeks" },
      { phase: "Decision & offer", duration: "1–2 weeks" },
      { phase: "Onboarding", duration: "4–8 weeks" },
    ];
  }
  if (tier === "finance") {
    return [
      { phase: "Application & assessment", duration: "1–2 weeks" },
      { phase: "Superday", duration: "1–3 weeks" },
      { phase: "Offer", duration: "1–2 weeks" },
      { phase: "Onboarding & training", duration: "4–8 weeks" },
    ];
  }
  return [
    { phase: "Application & test", duration: "1–3 weeks" },
    { phase: "Interviews", duration: "1–2 weeks" },
    { phase: "Offer", duration: "1–2 weeks" },
    { phase: "Onboarding & training", duration: "4–12 weeks" },
  ];
}

function internship(tier: CompanyTier): InternshipProgram {
  switch (tier) {
    case "faang":
    case "startup":
      return {
        title: "Software Engineering Internship",
        description: "A 10–12 week paid internship on a real team with a dedicated mentor and a shippable project. Strong interns frequently receive return offers.",
        stipend: "₹80,000–₹1,50,000 / month",
        duration: "10–12 weeks",
      };
    case "bigtech":
      return {
        title: "Engineering / Product Internship",
        description: "A structured 8–12 week internship with mentorship, learning sessions, and a scoped project that ships.",
        stipend: "₹60,000–₹1,10,000 / month",
        duration: "8–12 weeks",
      };
    case "finance":
      return {
        title: "Summer Analyst Program",
        description: "An 8–10 week analyst internship across technology and business desks with a strong full-time conversion pipeline.",
        stipend: "₹1,00,000–₹2,00,000 / month",
        duration: "8–10 weeks",
      };
    case "consulting":
      return {
        title: "Consulting / Technology Internship",
        description: "A 6–8 week internship on live client work with structured mentorship and evaluation for full-time roles.",
        stipend: "₹25,000–₹50,000 / month",
        duration: "6–8 weeks",
      };
    case "itservices":
      return {
        title: "Internship / Trainee Program",
        description: "A 6–24 week internship or trainee stint that begins with formal training before project work.",
        stipend: "₹15,000–₹30,000 / month",
        duration: "8–24 weeks",
      };
  }
}

function graduateProgram(tier: CompanyTier): GraduateProgram {
  switch (tier) {
    case "faang":
    case "bigtech":
    case "startup":
      return {
        title: "New Grad / Early Career Program",
        description: "Structured onboarding, mentorship, and ramp-up projects for university hires, with clear IC and management growth paths.",
      };
    case "finance":
      return {
        title: "Graduate Analyst Program",
        description: "A multi-week global training academy followed by desk or technology placement and a structured analyst track.",
      };
    case "consulting":
      return {
        title: "Graduate Analyst Program",
        description: "Cohort-based induction with sponsored certifications and rotations across client engagements.",
      };
    case "itservices":
      return {
        title: "Graduate Engineer Trainee (GET) Program",
        description: "Formal residential or online training at flagship campuses before deployment to client projects.",
      };
  }
}

function benefits(record: CompanyRecord): string[] {
  const base = isTech(record.tier)
    ? [
        "Competitive salary with equity (RSUs/options)",
        "Comprehensive health insurance",
        "Paid parental leave",
        "Learning & development budget",
        "Flexible / hybrid work",
      ]
    : record.tier === "finance"
      ? [
          "Competitive salary with performance bonus",
          "Health & wellness benefits",
          "Retirement / pension plans",
          "Learning academies",
          "Paid parental leave",
        ]
      : record.tier === "consulting"
        ? [
            "Competitive salary",
            "Health insurance",
            "Sponsored certifications",
            "Global mobility",
            "Structured mentorship",
          ]
        : [
            "Competitive salary",
            "Health insurance",
            "Structured training programs",
            "Job stability",
            "Global deployment opportunities",
          ];
  return Array.from(new Set([...base, ...record.perks]));
}

function workEnvironment(tier: CompanyTier): string {
  switch (tier) {
    case "faang":
    case "startup":
      return "A fast-paced, high-autonomy environment where individual impact is visible. Expect ambitious goals, exceptional peers, and a steep but rewarding learning curve.";
    case "bigtech":
      return "A collaborative, structured environment that balances large-scale impact with healthy work-life balance and strong mentorship.";
    case "finance":
      return "A high-performance, deadline-driven environment with significant responsibility early and strong rewards for results.";
    case "consulting":
      return "A client-facing, project-based environment with variety, deadlines, and broad exposure across industries and technologies.";
    case "itservices":
      return "A structured, training-rich environment ideal for building strong fundamentals, with broad project and domain exposure.";
  }
}

function growthOpportunities(tier: CompanyTier): string[] {
  if (isTech(tier)) {
    return [
      "Clear individual-contributor and management tracks",
      "Internal mobility across teams and products",
      "Mentorship and a strong tech-talk culture",
      "Conference and learning sponsorships",
    ];
  }
  if (tier === "finance") {
    return [
      "Analyst → Associate → VP progression",
      "Mobility across desks and divisions",
      "Sponsored qualifications (CFA / FRM)",
      "Global office transfers",
    ];
  }
  if (tier === "consulting") {
    return [
      "Rotations across clients and domains",
      "Sponsored certifications and MBA support",
      "Fast promotion for strong performers",
      "Global mobility",
    ];
  }
  return [
    "Trainee → Engineer → Lead progression",
    "Domain and technology specialization",
    "Onsite / global deployment opportunities",
    "Certification-linked growth",
  ];
}

function careerOpportunities(tier: CompanyTier): string {
  if (isTech(tier)) {
    return "Roles span software, data & AI, product, design, and business — backed by strong internship-to-fulltime and new-grad pipelines.";
  }
  if (tier === "finance") {
    return "Technology, quantitative, and business roles with structured analyst programs and strong campus hiring.";
  }
  if (tier === "consulting") {
    return "Opportunities across technology delivery, consulting, and business functions, filled through campus and lateral hiring.";
  }
  return "Large-scale campus hiring across engineering and business functions, with clear trainee-to-leadership pathways.";
}

export function buildCompanyProfile(record: CompanyRecord): CompanyProfile {
  const roles = resolveRoles(record);
  const process = hiringProcess(record.tier);

  const mins = roles.map((r) => r.salaryLpa[0]);
  const maxs = roles.map((r) => r.salaryLpa[1]);
  const min = mins.length ? Math.min(...mins) : 0;
  const max = maxs.length ? Math.max(...maxs) : 0;

  return {
    record,
    roles,
    hiringProcess: process,
    recruitmentStages: process.map((s) => s.stage),
    eligibility: eligibility(record.tier),
    hiringTimeline: hiringTimeline(record.tier),
    internship: internship(record.tier),
    graduateProgram: graduateProgram(record.tier),
    benefits: benefits(record),
    workEnvironment: workEnvironment(record.tier),
    growthOpportunities: growthOpportunities(record.tier),
    careerOpportunities: careerOpportunities(record.tier),
    salaryRange: { min, max, label: `₹${min}–${max} LPA` },
  };
}

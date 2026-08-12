import type { CompanyTier, RoleTemplate } from "./types";

/*
 * Shared role library. Companies reference these by key; salary bands are the
 * base (₹ LPA) later scaled by each company's salaryFactor. Adding a new role
 * here makes it instantly available to every company that lists its key.
 */
const BASE_ROLES: Record<string, Omit<RoleTemplate, "progression">> = {
  "software-engineer": {
    key: "software-engineer",
    title: "Software Engineer",
    family: "Engineering",
    description:
      "Design, build, test, and ship software systems used by millions, collaborating across the stack.",
    requiredSkills: ["Data structures", "Algorithms", "Programming", "System design", "Version control"],
    preferredSkills: ["Distributed systems", "Testing", "Cloud", "APIs"],
    education: "Bachelor's in CS or equivalent practical experience",
    certifications: ["AWS Certified Developer", "Oracle Java Certification"],
    experience: "0–3 years",
    baseSalaryLpa: [8, 28],
    interviewTopics: ["Coding (DSA)", "System design", "Behavioral"],
  },
  "frontend-engineer": {
    key: "frontend-engineer",
    title: "Frontend Engineer",
    family: "Engineering",
    description: "Craft fast, accessible, delightful user interfaces for web and mobile web.",
    requiredSkills: ["JavaScript", "React", "HTML/CSS", "Accessibility", "UI implementation"],
    preferredSkills: ["TypeScript", "Testing", "Performance", "Design systems"],
    education: "Bachelor's, bootcamp, or self-taught portfolio",
    certifications: ["Meta Front-End Developer"],
    experience: "0–3 years",
    baseSalaryLpa: [7, 24],
    interviewTopics: ["JavaScript", "UI coding", "System design (frontend)"],
  },
  "backend-engineer": {
    key: "backend-engineer",
    title: "Backend Engineer",
    family: "Engineering",
    description: "Build reliable server-side services, APIs, and data layers that scale.",
    requiredSkills: ["Programming", "APIs", "Databases", "System design", "Data structures"],
    preferredSkills: ["Distributed systems", "Cloud", "Caching", "Message queues"],
    education: "Bachelor's in CS or equivalent",
    certifications: ["AWS Certified Developer", "MongoDB Developer"],
    experience: "0–4 years",
    baseSalaryLpa: [8, 26],
    interviewTopics: ["Coding (DSA)", "System design", "Databases"],
  },
  "fullstack-engineer": {
    key: "fullstack-engineer",
    title: "Full Stack Engineer",
    family: "Engineering",
    description: "Own features end to end, from database to interface.",
    requiredSkills: ["JavaScript", "React", "APIs", "Databases", "System design"],
    preferredSkills: ["TypeScript", "Cloud", "Testing", "CI/CD"],
    education: "Bachelor's or bootcamp",
    certifications: ["Meta Full-Stack", "AWS Developer"],
    experience: "1–4 years",
    baseSalaryLpa: [8, 27],
    interviewTopics: ["Coding", "Full-stack design", "Behavioral"],
  },
  "ai-engineer": {
    key: "ai-engineer",
    title: "AI Engineer",
    family: "Data & AI",
    description: "Build AI-powered product features on top of LLMs and ML services.",
    requiredSkills: ["Python", "Machine learning", "APIs", "Prompt engineering", "System design"],
    preferredSkills: ["LLMs", "Vector databases", "MLOps", "Cloud"],
    education: "Bachelor's/Master's in CS or related",
    certifications: ["Azure AI Engineer", "TensorFlow Developer"],
    experience: "1–5 years",
    baseSalaryLpa: [12, 40],
    interviewTopics: ["ML fundamentals", "Coding", "System design (ML)"],
  },
  "ml-engineer": {
    key: "ml-engineer",
    title: "Machine Learning Engineer",
    family: "Data & AI",
    description: "Design, train, and deploy machine learning systems in production.",
    requiredSkills: ["Python", "Machine learning", "Mathematics", "System design", "Data structures"],
    preferredSkills: ["Deep learning", "MLOps", "Cloud", "Distributed training"],
    education: "Bachelor's/Master's in CS, ML, or related",
    certifications: ["AWS ML Specialty", "TensorFlow Developer"],
    experience: "2–6 years",
    baseSalaryLpa: [12, 42],
    interviewTopics: ["ML theory", "Coding", "ML system design"],
  },
  "cloud-engineer": {
    key: "cloud-engineer",
    title: "Cloud Engineer",
    family: "Engineering",
    description: "Design and automate secure, scalable cloud infrastructure.",
    requiredSkills: ["Cloud", "Linux", "Networking", "Scripting", "CI/CD"],
    preferredSkills: ["Kubernetes", "Terraform", "Security", "Observability"],
    education: "Bachelor's or equivalent experience",
    certifications: ["AWS Solutions Architect", "CKA (Kubernetes)"],
    experience: "1–5 years",
    baseSalaryLpa: [9, 30],
    interviewTopics: ["Cloud architecture", "Networking", "Scripting"],
  },
  "cybersecurity-engineer": {
    key: "cybersecurity-engineer",
    title: "Cybersecurity Engineer",
    family: "Engineering",
    description: "Protect systems and data by finding and fixing security weaknesses.",
    requiredSkills: ["Networking", "Security", "Programming", "Threat modeling", "Linux"],
    preferredSkills: ["Incident response", "Cloud security", "Cryptography", "SIEM"],
    education: "Bachelor's in CS/Security",
    certifications: ["CISSP", "OSCP"],
    experience: "2–6 years",
    baseSalaryLpa: [9, 30],
    interviewTopics: ["Security concepts", "Networking", "Scenario analysis"],
  },
  "product-manager": {
    key: "product-manager",
    title: "Product Manager",
    family: "Product & Design",
    description: "Own product strategy, prioritization, and delivery across teams.",
    requiredSkills: ["Product strategy", "Communication", "Analytics", "Roadmapping", "User research"],
    preferredSkills: ["SQL", "A/B testing", "Stakeholder management", "Technical fluency"],
    education: "Bachelor's; MBA a plus",
    certifications: ["Pragmatic Institute", "Reforge"],
    experience: "2–6 years",
    baseSalaryLpa: [15, 45],
    interviewTopics: ["Product sense", "Analytical", "Behavioral"],
  },
  "uiux-designer": {
    key: "uiux-designer",
    title: "UI/UX Designer",
    family: "Product & Design",
    description: "Research users and design intuitive, beautiful product experiences.",
    requiredSkills: ["UI design", "UX research", "Prototyping", "Figma", "Communication"],
    preferredSkills: ["Design systems", "Interaction design", "Accessibility", "User testing"],
    education: "Bachelor's or design certificate + portfolio",
    certifications: ["Google UX Design", "NN/g UX"],
    experience: "1–5 years",
    baseSalaryLpa: [7, 24],
    interviewTopics: ["Portfolio review", "Design challenge", "Behavioral"],
  },
  "data-scientist": {
    key: "data-scientist",
    title: "Data Scientist",
    family: "Data & AI",
    description: "Use statistics and machine learning to turn data into decisions.",
    requiredSkills: ["Python", "Statistics", "Machine learning", "SQL", "Communication"],
    preferredSkills: ["Experimentation", "Data visualization", "Deep learning", "Business acumen"],
    education: "Bachelor's/Master's in a quantitative field",
    certifications: ["Google Data Analytics", "TensorFlow Developer"],
    experience: "1–5 years",
    baseSalaryLpa: [10, 34],
    interviewTopics: ["Statistics", "ML", "Case study", "Coding"],
  },
  "business-analyst": {
    key: "business-analyst",
    title: "Business Analyst",
    family: "Business",
    description: "Bridge business and technology by analyzing needs and shaping solutions.",
    requiredSkills: ["Analysis", "SQL", "Communication", "Requirements gathering", "Excel"],
    preferredSkills: ["Data visualization", "Stakeholder management", "Domain knowledge"],
    education: "Bachelor's in business, CS, or related",
    certifications: ["CBAP", "Google Data Analytics"],
    experience: "0–4 years",
    baseSalaryLpa: [7, 22],
    interviewTopics: ["Case study", "SQL", "Behavioral"],
  },
  marketing: {
    key: "marketing",
    title: "Marketing",
    family: "Business",
    description: "Drive awareness, demand, and growth through campaigns and brand.",
    requiredSkills: ["Communication", "Content", "Analytics", "Campaign management", "Creativity"],
    preferredSkills: ["SEO/SEM", "Marketing automation", "Brand strategy", "Copywriting"],
    education: "Bachelor's in marketing, business, or communications",
    certifications: ["Google Ads", "HubSpot"],
    experience: "0–5 years",
    baseSalaryLpa: [6, 22],
    interviewTopics: ["Portfolio/campaigns", "Analytics", "Behavioral"],
  },
  finance: {
    key: "finance",
    title: "Finance",
    family: "Business",
    description: "Manage financial planning, analysis, and reporting to guide the business.",
    requiredSkills: ["Financial analysis", "Excel", "Accounting", "Modeling", "Communication"],
    preferredSkills: ["SQL", "Valuation", "Forecasting", "ERP systems"],
    education: "Bachelor's in finance, accounting, or economics",
    certifications: ["CFA", "CPA"],
    experience: "0–5 years",
    baseSalaryLpa: [7, 26],
    interviewTopics: ["Financial concepts", "Case study", "Behavioral"],
  },
  hr: {
    key: "hr",
    title: "Human Resources",
    family: "Business",
    description: "Attract, develop, and retain talent while shaping company culture.",
    requiredSkills: ["Communication", "Recruiting", "Empathy", "Organization", "Conflict resolution"],
    preferredSkills: ["HRIS", "People analytics", "Employer branding", "L&D"],
    education: "Bachelor's in HR, psychology, or business",
    certifications: ["SHRM-CP", "PHR"],
    experience: "0–5 years",
    baseSalaryLpa: [6, 20],
    interviewTopics: ["Situational", "Behavioral", "Culture fit"],
  },
};

/** Typical progression path per role (junior → senior tracks). */
const ROLE_PROGRESSION: Record<string, string[]> = {
  "software-engineer": ["SDE I", "SDE II", "Senior SWE", "Staff Engineer", "Principal Engineer"],
  "frontend-engineer": ["Frontend Engineer", "Senior Frontend Engineer", "Staff Frontend Engineer", "Frontend Architect"],
  "backend-engineer": ["Backend Engineer", "Senior Backend Engineer", "Staff Engineer", "Principal Engineer"],
  "fullstack-engineer": ["Full Stack Engineer", "Senior Engineer", "Staff Engineer", "Engineering Lead"],
  "ai-engineer": ["AI Engineer", "Senior AI Engineer", "Staff AI Engineer", "AI Architect"],
  "ml-engineer": ["ML Engineer", "Senior ML Engineer", "Staff ML Engineer", "ML Architect / Applied Science Lead"],
  "cloud-engineer": ["Cloud Engineer", "Senior Cloud Engineer", "Cloud Architect", "Principal Architect"],
  "cybersecurity-engineer": ["Security Engineer", "Senior Security Engineer", "Security Architect", "Head of Security"],
  "product-manager": ["Associate PM", "Product Manager", "Senior PM", "Group PM", "Director of Product"],
  "uiux-designer": ["Product Designer", "Senior Designer", "Lead Designer", "Design Manager"],
  "data-scientist": ["Data Scientist", "Senior Data Scientist", "Staff Data Scientist", "Principal / DS Manager"],
  "business-analyst": ["Business Analyst", "Senior Analyst", "Lead Analyst", "Product / Program Manager"],
  marketing: ["Marketing Associate", "Marketing Manager", "Senior Manager", "Head of Marketing"],
  finance: ["Financial Analyst", "Senior Analyst", "Finance Manager", "Finance Director"],
  hr: ["HR Associate", "HR Business Partner", "Senior HRBP", "Head of People"],
};

/** Role library with progression attached. */
export const ROLE_LIBRARY: Record<string, RoleTemplate> = Object.fromEntries(
  Object.entries(BASE_ROLES).map(([key, base]) => [
    key,
    { ...base, progression: ROLE_PROGRESSION[key] ?? [] },
  ]),
);

const ENGINEERING_ROLES = [
  "software-engineer",
  "frontend-engineer",
  "backend-engineer",
  "fullstack-engineer",
  "cloud-engineer",
  "cybersecurity-engineer",
];
const DATA_AI_ROLES = ["ai-engineer", "ml-engineer", "data-scientist"];
const PRODUCT_ROLES = ["product-manager", "uiux-designer"];
const BUSINESS_ROLES = ["business-analyst", "marketing", "finance", "hr"];

/** Curated default role set per tier — keeps each company realistic yet scalable. */
export function rolesForTier(tier: CompanyTier): string[] {
  switch (tier) {
    case "faang":
    case "bigtech":
    case "startup":
      return [...ENGINEERING_ROLES, ...DATA_AI_ROLES, ...PRODUCT_ROLES, ...BUSINESS_ROLES];
    case "consulting":
      return [
        "software-engineer",
        "cloud-engineer",
        "cybersecurity-engineer",
        "data-scientist",
        "business-analyst",
        "product-manager",
        "finance",
        "hr",
        "marketing",
      ];
    case "finance":
      return [
        "software-engineer",
        "backend-engineer",
        "data-scientist",
        "cybersecurity-engineer",
        "business-analyst",
        "product-manager",
        "finance",
        "hr",
      ];
    case "itservices":
      return [
        "software-engineer",
        "frontend-engineer",
        "backend-engineer",
        "fullstack-engineer",
        "cloud-engineer",
        "cybersecurity-engineer",
        "data-scientist",
        "business-analyst",
        "hr",
      ];
  }
}

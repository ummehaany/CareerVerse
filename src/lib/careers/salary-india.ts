import type { CareerSalary } from "./types";

/**
 * Realistic Indian market salary ranges in ₹ LPA (Lakhs Per Annum), tuned per
 * role — NOT a direct USD conversion. Entry-to-experienced bands. Illustrative.
 */
export const INDIA_SALARY_LPA: Record<string, [number, number]> = {
  // Technology
  "software-engineer": [6, 30],
  "frontend-developer": [5, 25],
  "backend-developer": [6, 28],
  "fullstack-developer": [6, 30],
  "mobile-developer": [5, 26],
  "devops-engineer": [7, 32],
  "cloud-architect": [15, 50],
  "site-reliability-engineer": [12, 40],
  "security-engineer": [8, 35],
  "qa-engineer": [4, 18],
  "game-developer": [5, 24],
  "blockchain-developer": [8, 35],
  "embedded-engineer": [5, 24],
  "database-administrator": [5, 22],
  "systems-architect": [18, 55],
  // Data & AI
  "data-scientist": [8, 35],
  "data-analyst": [4, 16],
  "data-engineer": [8, 32],
  "ml-engineer": [10, 45],
  "ai-engineer": [10, 50],
  "ai-researcher": [15, 60],
  "business-intelligence-analyst": [6, 22],
  "computer-vision-engineer": [10, 42],
  "nlp-engineer": [10, 45],
  "quantitative-analyst": [12, 60],
  "statistician": [6, 24],
  // Design
  "ux-designer": [5, 25],
  "ui-designer": [4, 22],
  "product-designer": [8, 35],
  "graphic-designer": [3, 12],
  "motion-designer": [4, 16],
  "ux-researcher": [7, 28],
  "industrial-designer": [4, 18],
  "interior-designer": [3, 15],
  "illustrator": [3, 14],
  "animator": [4, 18],
  // Product & Management
  "product-manager": [12, 45],
  "project-manager": [8, 30],
  "program-manager": [15, 45],
  "scrum-master": [8, 28],
  "business-analyst": [6, 22],
  "operations-manager": [7, 28],
  "technical-program-manager": [18, 50],
  // Business
  "entrepreneur": [0, 100],
  "startup-founder": [0, 80],
  "management-consultant": [12, 45],
  "business-development-manager": [6, 30],
  "venture-capitalist": [20, 100],
  "chief-executive": [30, 150],
  "strategy-manager": [12, 40],
  // Finance
  "financial-analyst": [5, 20],
  "investment-banker": [12, 60],
  "chartered-accountant": [7, 30],
  "actuary": [8, 40],
  "financial-planner": [4, 18],
  "accountant": [3, 12],
  "auditor": [4, 16],
  "risk-manager": [10, 35],
  "portfolio-manager": [15, 70],
  "tax-advisor": [4, 18],
  // Marketing & Media
  "digital-marketer": [4, 18],
  "content-strategist": [5, 20],
  "seo-specialist": [3, 15],
  "social-media-manager": [3, 14],
  "brand-manager": [8, 30],
  "copywriter": [3, 14],
  "growth-marketer": [6, 28],
  "public-relations-specialist": [4, 16],
  "marketing-manager": [8, 30],
  "content-creator": [0, 40],
  // Healthcare
  "doctor": [8, 40],
  "nurse": [3, 10],
  "pharmacist": [3, 10],
  "physiotherapist": [3, 10],
  "dentist": [4, 20],
  "surgeon": [12, 60],
  "psychologist": [4, 15],
  "nutritionist": [3, 10],
  "medical-lab-technician": [2, 8],
  "radiologist": [12, 50],
  "veterinarian": [4, 15],
  "healthcare-administrator": [5, 20],
  // Law & Public
  "lawyer": [5, 30],
  "corporate-lawyer": [8, 45],
  "paralegal": [3, 10],
  "judge": [12, 30],
  "policy-analyst": [5, 18],
  "civil-services-officer": [6, 25],
  "human-rights-advocate": [3, 12],
  // Engineering
  "mechanical-engineer": [3, 15],
  "electrical-engineer": [3, 15],
  "civil-engineer": [3, 14],
  "aerospace-engineer": [5, 20],
  "chemical-engineer": [4, 16],
  "biomedical-engineer": [4, 14],
  "environmental-engineer": [4, 14],
  "robotics-engineer": [6, 24],
  "industrial-engineer": [4, 16],
  "automotive-engineer": [4, 18],
  // Science
  "research-scientist": [6, 25],
  "biotechnologist": [3, 14],
  "environmental-scientist": [4, 14],
  "physicist": [6, 22],
  "chemist": [3, 14],
  "geologist": [4, 16],
  // Education
  "teacher": [3, 10],
  "professor": [8, 25],
  "instructional-designer": [5, 18],
  "education-consultant": [4, 16],
  // Aviation & Transport
  "pilot": [15, 80],
  "air-traffic-controller": [8, 25],
  "logistics-manager": [5, 22],
  // Architecture, Media & Other
  "architect": [4, 20],
  "journalist": [3, 14],
  "photographer": [2, 12],
  "chef": [3, 15],
  "cybersecurity-analyst": [6, 28],
  "hr-manager": [6, 25],
};

export interface IndiaSalary {
  minLpa: number;
  maxLpa: number;
}

/** India LPA range for a career, with a sane fallback derived from the USD band. */
export function getIndiaSalaryLpa(slug: string, usd: CareerSalary): IndiaSalary {
  const entry = INDIA_SALARY_LPA[slug];
  if (entry) return { minLpa: entry[0], maxLpa: entry[1] };
  // Fallback (should be rare — every catalog slug is covered above).
  const minLpa = Math.max(2, Math.round(usd.min / 130000) + 2);
  const maxLpa = Math.max(minLpa + 2, Math.round(usd.max / 90000) + 4);
  return { minLpa, maxLpa };
}

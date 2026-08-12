import type { InterviewDifficulty, InterviewType } from "@/types/interview";

/*
 * Offline question bank. Produces realistic, role-aware mock-interview questions
 * without any AI, so the module always works. The shape matches the AI service's
 * output ({ question, focusArea }) so the two are interchangeable.
 */

export interface BankQuestion {
  question: string;
  focusArea: string;
}

type Template = { q: string; focus: string };

const POOLS: Record<InterviewType, Template[]> = {
  hr: [
    { q: "Tell me about yourself and why you're interested in the {role} role.", focus: "Introduction" },
    { q: "Why do you want this position, and what attracts you to it?", focus: "Motivation" },
    { q: "What are your greatest strengths as a {role}?", focus: "Strengths" },
    { q: "Describe a weakness you're actively working to improve.", focus: "Self-awareness" },
    { q: "Where do you see yourself in five years?", focus: "Goals" },
    { q: "What kind of work environment helps you do your best work?", focus: "Culture fit" },
    { q: "How do you handle feedback and criticism?", focus: "Growth" },
    { q: "Tell me about a time you had to adapt to a big change.", focus: "Adaptability" },
    { q: "What motivates you day to day in your work?", focus: "Motivation" },
    { q: "Do you have any questions for us about the role or team?", focus: "Engagement" },
  ],
  technical: [
    { q: "Walk me through a technically challenging problem you solved as a {role}.", focus: "Problem solving" },
    { q: "Which tools and technologies do you rely on most as a {role}, and why?", focus: "Tools" },
    { q: "How do you ensure the quality and reliability of your work?", focus: "Quality" },
    { q: "Explain a core concept in your field to a non-expert.", focus: "Fundamentals" },
    { q: "How do you approach learning a new technology or skill quickly?", focus: "Learning" },
    { q: "Describe your process from a blank problem to a finished solution.", focus: "Process" },
    { q: "How do you debug or troubleshoot when something isn't working?", focus: "Troubleshooting" },
    { q: "What trade-offs do you weigh when making a key technical decision?", focus: "Judgment" },
    { q: "Tell me about a time you improved performance or efficiency.", focus: "Impact" },
    { q: "How do you keep your skills current in the {role} field?", focus: "Growth" },
  ],
  behavioral: [
    { q: "Tell me about a time you faced a significant challenge at work. How did you handle it?", focus: "Resilience" },
    { q: "Describe a conflict with a teammate and how you resolved it.", focus: "Teamwork" },
    { q: "Give an example of a time you took initiative beyond your responsibilities.", focus: "Ownership" },
    { q: "Tell me about a time you failed. What did you learn?", focus: "Growth" },
    { q: "Describe a time you had to meet a tight deadline. How did you manage it?", focus: "Time management" },
    { q: "Tell me about a time you had to influence someone without authority.", focus: "Influence" },
    { q: "Describe difficult feedback you received and how you responded.", focus: "Feedback" },
    { q: "Give an example of a time you led a project or a team.", focus: "Leadership" },
    { q: "Tell me about a decision you made with incomplete information.", focus: "Judgment" },
    { q: "Describe a time you went above and beyond for a stakeholder.", focus: "Impact" },
  ],
  "case-study": [
    { q: "How would you estimate the market size for a new product relevant to a {role} in India?", focus: "Estimation" },
    { q: "A key metric dropped 20% overnight. How would you investigate?", focus: "Analysis" },
    { q: "Design an approach to improve efficiency in a process you know well.", focus: "Design" },
    { q: "How would you prioritize features with limited time and budget?", focus: "Prioritization" },
    { q: "Walk me through how you'd structure a solution to an ambiguous problem.", focus: "Structure" },
    { q: "A stakeholder disagrees with your recommendation. How do you proceed?", focus: "Communication" },
    { q: "How would you measure the success of a project you deliver?", focus: "Metrics" },
    { q: "Break a complex problem in your field into smaller, solvable parts.", focus: "Decomposition" },
  ],
  "group-discussion": [
    { q: "Is remote work better than in-office work? Argue your position.", focus: "Articulation" },
    { q: "Should AI tools be embraced in professional {role} work? Discuss.", focus: "Reasoning" },
    { q: "What matters more: speed of delivery or quality? Defend your view.", focus: "Debate" },
    { q: "How can India's ecosystem create more globally competitive companies?", focus: "Perspective" },
    { q: "Is a formal degree still necessary to succeed as a {role}?", focus: "Opinion" },
    { q: "Should companies prioritize profit or social impact?", focus: "Balance" },
    { q: "How do you build consensus in a group with opposing views?", focus: "Collaboration" },
    { q: "What's the biggest challenge facing your industry today?", focus: "Awareness" },
  ],
};

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fill(template: string, role: string): string {
  return template.replace(/\{role\}/g, role.trim() || "professional");
}

export function buildLocalQuestions(
  role: string,
  type: InterviewType,
  _difficulty: InterviewDifficulty,
  count: number,
): BankQuestion[] {
  const pool = POOLS[type] ?? POOLS.technical;
  return shuffled(pool)
    .slice(0, Math.max(1, Math.min(count, pool.length)))
    .map((t) => ({ question: fill(t.q, role), focusArea: t.focus }));
}

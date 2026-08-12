import type { CompanyProfile, CompanyRole } from "@/lib/companies/types";
import type { InterviewKit } from "./types";

/*
 * Company- and role-specific interview preparation kit. Deterministic and
 * client-safe; a real model can replace buildInterviewKit later.
 */
export function buildInterviewKit(profile: CompanyProfile, role: CompanyRole): InterviewKit {
  const company = profile.record.name;
  const value = profile.record.cultureValues[0] ?? "our values";
  const topic = role.interviewTopics[0] ?? "core fundamentals";

  const groups = [
    {
      category: "HR & screening",
      icon: "chat",
      questions: [
        `Walk me through your background and why ${company}.`,
        `Why this ${role.title} role specifically?`,
        "What are your salary expectations and notice period?",
        "Where do you see yourself in three years?",
      ],
    },
    {
      category: "Behavioral",
      icon: "users",
      questions: [
        "Tell me about a time you handled a difficult teammate.",
        "Describe a project you're most proud of and your exact role.",
        "Tell me about a time you failed and what you learned.",
        `Give an example of ${value.toLowerCase()} in your work.`,
      ],
    },
    {
      category: "Technical",
      icon: "code",
      questions: role.interviewTopics.map((t) => `Deep-dive: ${t}.`).concat([
        `Explain a ${role.family.toLowerCase()} concept you know well.`,
      ]),
    },
    {
      category: "Problem solving",
      icon: "puzzle",
      questions: [
        `How would you approach ${topic} under ambiguous requirements?`,
        "Estimate the scale of a system you'd design for this role.",
        "Walk through how you debug a hard, intermittent issue.",
      ],
    },
    {
      category: "Coding practice",
      icon: "target",
      questions: [
        "Two-pointer / sliding-window array problem.",
        "Hash-map frequency or grouping problem.",
        "Tree / graph traversal (BFS/DFS).",
        "Dynamic programming warm-up.",
      ],
    },
    {
      category: "Leadership & ownership",
      icon: "flag",
      questions: [
        "Tell me about a time you led without authority.",
        "How do you prioritize when everything feels urgent?",
        "Describe a decision you made with incomplete information.",
      ],
    },
    {
      category: `${company} values`,
      icon: "heart",
      questions: profile.record.cultureValues.map((v) => `How do you embody "${v}"?`),
    },
  ];

  const tips = [
    `Study ${company}'s mission, products, and recent news before the interview.`,
    "Think out loud — communicate your reasoning as you solve.",
    "Prepare 5–6 STAR stories you can adapt to many questions.",
    `Focus practice on: ${profile.record.interviewFocus.join(", ")}.`,
  ];

  return { roleTitle: role.title, groups, tips };
}

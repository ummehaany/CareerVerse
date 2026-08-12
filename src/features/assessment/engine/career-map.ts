import type { Career } from "@/lib/careers/types";
import type { DimensionScores } from "./types";
import { emptyScores } from "./dimensions";

/*
 * Career mapping. Derives each career's "ideal candidate" dimension vector from
 * its category, title, and skills — deterministically, so every career in the
 * catalog (and any added later) gets a profile for free. Keyword-driven, not a
 * hand-maintained table.
 */
export function careerDimensionVector(c: Career): DimensionScores {
  const s = emptyScores();
  const text = `${c.category} ${c.title} ${c.skills.join(" ")}`.toLowerCase();
  const has = (...w: string[]): boolean => w.some((x) => text.includes(x));

  s.technicalInclination = has("software", "engineer", "data", "program", "cloud", "system", "developer", "security", "machine", "ai", "comput", "devops", "backend", "frontend")
    ? 88
    : has("technolog", "digital", "technical", "product")
      ? 58
      : 28;

  s.analyticalThinking = has("data", "analy", "research", "financ", "scien", "statist", "quant", "engineer", "machine")
    ? 86
    : has("business", "strateg", "operations")
      ? 60
      : 42;

  s.creativity = has("design", "ux", "ui", "art", "creativ", "content", "market", "brand", "media", "writer", "product")
    ? 82
    : 38;

  s.leadership = has("manager", "lead", "product", "director", "principal", "head", "strateg", "architect")
    ? 78
    : 45;

  s.communication = has("market", "sales", "teach", "content", "writer", "hr", "communica", "design", "product", "relations", "manager")
    ? 76
    : 50;

  s.problemSolving = has("engineer", "develop", "scien", "research", "analy", "architect", "security", "data", "machine")
    ? 82
    : 55;

  s.collaboration = has("product", "design", "manager", "team", "hr", "sales", "support", "nurse", "teach", "market")
    ? 74
    : 52;

  s.independence = has("research", "writer", "analyst", "develop", "scien", "consultant", "engineer")
    ? 64
    : 50;

  s.riskTolerance = has("startup", "entrepreneur", "founder", "sales", "trading", "product", "growth")
    ? 66
    : 45;

  s.learningStyle = has("engineer", "data", "ai", "develop", "scien", "research", "machine", "cloud")
    ? 80
    : 56;

  // Dimensions that are broadly relevant get a stable mid-high baseline so they
  // don't dominate ranking but still contribute.
  s.interests = 62;
  s.motivation = 62;
  s.careerValues = 55;
  s.workPreferences = 55;
  s.personality = 55;

  return s;
}

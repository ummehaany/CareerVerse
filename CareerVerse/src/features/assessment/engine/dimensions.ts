import type { DimensionId, DimensionScores } from "./types";

/** The 15 career dimensions the assessment measures, in display order. */
export const DIMENSIONS: { id: DimensionId; label: string; description: string }[] = [
  { id: "interests", label: "Interests", description: "The domains and activities that naturally pull your attention." },
  { id: "personality", label: "Personality", description: "How you engage with people, decisions, and change." },
  { id: "workPreferences", label: "Work preferences", description: "The environment, pace, and structure you do your best work in." },
  { id: "technicalInclination", label: "Technical inclination", description: "Your comfort building and working with technical systems." },
  { id: "creativity", label: "Creativity", description: "Your drive to generate original ideas and designs." },
  { id: "leadership", label: "Leadership", description: "Your appetite for guiding people and owning outcomes." },
  { id: "communication", label: "Communication", description: "How effectively you express ideas and connect with others." },
  { id: "problemSolving", label: "Problem solving", description: "How you approach ambiguous, hard problems." },
  { id: "analyticalThinking", label: "Analytical thinking", description: "Your tendency to reason with data, logic, and structure." },
  { id: "learningStyle", label: "Learning agility", description: "How quickly and readily you pick up new skills." },
  { id: "riskTolerance", label: "Risk tolerance", description: "Your comfort with uncertainty and bold bets." },
  { id: "collaboration", label: "Collaboration", description: "How much you thrive working closely with a team." },
  { id: "independence", label: "Independence", description: "Your preference for autonomy and self-direction." },
  { id: "careerValues", label: "Career values", description: "What you most want a career to deliver." },
  { id: "motivation", label: "Motivation", description: "Your drive, persistence, and self-direction." },
];

export const DIMENSION_LABEL: Record<DimensionId, string> = DIMENSIONS.reduce(
  (acc, d) => {
    acc[d.id] = d.label;
    return acc;
  },
  {} as Record<DimensionId, string>,
);

export const DIMENSION_DESCRIPTION: Record<DimensionId, string> = DIMENSIONS.reduce(
  (acc, d) => {
    acc[d.id] = d.description;
    return acc;
  },
  {} as Record<DimensionId, string>,
);

export function emptyScores(): DimensionScores {
  return DIMENSIONS.reduce((acc, d) => {
    acc[d.id] = 0;
    return acc;
  }, {} as DimensionScores);
}

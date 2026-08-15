/*
 * READ-ONLY diagnostic — investigates why multiple careers cluster around
 * near-identical matchPercent values (e.g. 56-57%).
 *
 * Does NOT modify scoring.ts, traits.ts, or fields.ts. Imports and calls the
 * REAL scoreCareerDiscovery() plus re-derives the same intermediate values
 * scoring.ts computes internally (categoryFit, traitFit, per-trait weighted
 * contribution) so we can print a full breakdown without changing the engine.
 *
 * Run: npx tsx scripts/diagnose-clustering.ts
 */

import { getCareers } from "../src/lib/careers/catalog";
import { careerTraitVector, TRAITS, TRAIT_LABELS } from "../src/features/assessment/discovery/traits";
import { FIELDS, FIELDS_BY_ID, fieldForCategory } from "../src/features/assessment/discovery/fields";
import { BASIC_QUESTIONS, ADVANCED_QUESTIONS } from "../src/features/assessment/discovery/questions";
import { scoreCareerDiscovery } from "../src/features/assessment/discovery/scoring";
import type { DiscoveryAnswers, DiscoveryQuestion, FieldId, TraitId } from "../src/features/assessment/discovery/types";

// ── Re-derive fieldFit / traitFit exactly the way scoring.ts does internally ──
// (scoring.ts doesn't currently expose these intermediate values, so we
// reimplement the SAME accumulation logic read directly from that file, and
// cross-check our own ranking against the real scoreCareerDiscovery() output
// below to make sure this reimplementation is faithful.)

type FieldScoreMap = Record<FieldId, number>;
type TraitScoreMap = Record<TraitId, number>;

function emptyFieldScores(): FieldScoreMap {
  const out = {} as FieldScoreMap;
  FIELDS.forEach((f) => (out[f.id] = 0));
  return out;
}
function emptyTraitScoreMap(): TraitScoreMap {
  const out = {} as TraitScoreMap;
  TRAITS.forEach((t) => (out[t] = 0));
  return out;
}

function applyOption(
  question: DiscoveryQuestion,
  optionValue: string,
  fieldScores: FieldScoreMap,
  traitScores: TraitScoreMap,
) {
  const option = question.options.find((o) => o.value === optionValue);
  if (!option) return;
  if (option.fieldWeights) {
    (Object.entries(option.fieldWeights) as [FieldId, number][]).forEach(([fieldId, amount]) => {
      fieldScores[fieldId] += amount;
    });
  }
  if (option.traitWeights) {
    (Object.entries(option.traitWeights) as [TraitId, number][]).forEach(([traitId, amount]) => {
      traitScores[traitId] += amount;
    });
  }
}

function accumulatePotential(question: DiscoveryQuestion, fieldPotential: FieldScoreMap, traitPotential: TraitScoreMap) {
  if (question.options.length === 0) return;
  FIELDS.forEach((f) => {
    const best = Math.max(0, ...question.options.map((o) => o.fieldWeights?.[f.id] ?? 0));
    fieldPotential[f.id] += best;
  });
  TRAITS.forEach((t) => {
    const best = Math.max(0, ...question.options.map((o) => o.traitWeights?.[t] ?? 0));
    traitPotential[t] += best;
  });
}

function scoreAnswers(
  questions: DiscoveryQuestion[],
  answers: DiscoveryAnswers,
  fieldScores: FieldScoreMap,
  traitScores: TraitScoreMap,
  fieldPotential: FieldScoreMap,
  traitPotential: TraitScoreMap,
) {
  questions.forEach((question) => {
    if (question.options.length > 0) accumulatePotential(question, fieldPotential, traitPotential);
    const answer = answers[question.id];
    if (answer == null) return;
    if (Array.isArray(answer)) {
      answer.forEach((v) => applyOption(question, String(v), fieldScores, traitScores));
    } else {
      applyOption(question, String(answer), fieldScores, traitScores);
    }
  });
}

function applyOrgEngagement(answers: DiscoveryAnswers, fieldScores: FieldScoreMap, fieldPotential: FieldScoreMap) {
  const fieldAnswer = answers.fieldInterest;
  const orgAnswer = answers.organizationInterest;
  if (typeof fieldAnswer !== "string") return;
  if (!(fieldAnswer in fieldScores)) return;
  const count = Array.isArray(orgAnswer) ? orgAnswer.length : 0;
  const bonus = Math.min(count, 5);
  fieldScores[fieldAnswer as FieldId] += bonus;
  fieldPotential[fieldAnswer as FieldId] += 5;
}

function computeFitVectors(basic: DiscoveryAnswers, advanced: DiscoveryAnswers | null) {
  const fieldScores = emptyFieldScores();
  const traitScores = emptyTraitScoreMap();
  const fieldPotential = emptyFieldScores();
  const traitPotential = emptyTraitScoreMap();

  scoreAnswers(BASIC_QUESTIONS, basic, fieldScores, traitScores, fieldPotential, traitPotential);
  if (advanced) scoreAnswers(ADVANCED_QUESTIONS, advanced, fieldScores, traitScores, fieldPotential, traitPotential);
  applyOrgEngagement(basic, fieldScores, fieldPotential);

  const fieldFit = {} as Record<FieldId, number>;
  FIELDS.forEach((f) => {
    fieldFit[f.id] = fieldPotential[f.id] > 0 ? Math.min(1, Math.max(0, fieldScores[f.id] / fieldPotential[f.id])) : 0;
  });
  const traitFit = {} as Record<TraitId, number>;
  TRAITS.forEach((t) => {
    traitFit[t] = traitPotential[t] > 0 ? Math.min(1, Math.max(0, traitScores[t] / traitPotential[t])) : 0;
  });
  return { fieldFit, traitFit, traitScores, traitPotential };
}

// ── Full per-career breakdown, using the REAL scoreCareerDiscovery() for the
// authoritative matchPercent/rank, and the reimplemented fieldFit/traitFit
// above purely to expose the intermediate numbers for printing. ──

function fullBreakdown(basic: DiscoveryAnswers, advanced: DiscoveryAnswers | null, label: string) {
  const { fieldFit, traitFit, traitScores, traitPotential } = computeFitVectors(basic, advanced);
  const real = scoreCareerDiscovery(basic, advanced);
  const careers = getCareers();

  console.log("\n" + "=".repeat(90));
  console.log(`PROFILE: ${label}`);
  console.log("=".repeat(90));
  console.log("Field fit (fieldScores/fieldPotential, 0-1):");
  FIELDS.forEach((f) => console.log(`  ${f.label.padEnd(34)} ${(fieldFit[f.id] * 100).toFixed(1)}%`));
  console.log("\nTrait fit (traitScores/traitPotential, 0-1) — this is the user's derived trait vector:");
  console.log("  (raw score / potential shown alongside — potential=0 means NO question in this");
  console.log("   answer set ever carries weight for this trait, so it silently defaults to 0% fit,");
  console.log("   not because the user signaled \"low\" on it.)");
  TRAITS.forEach((t) =>
    console.log(
      `  ${TRAIT_LABELS[t].padEnd(34)} ${(traitFit[t] * 100).toFixed(1)}%   (raw ${traitScores[t]} / potential ${traitPotential[t]}${traitPotential[t] === 0 ? "  <-- NEVER MEASURED for this answer set" : ""})`,
    ),
  );
  console.log(`\nTop field: ${real.topField.label} (${real.topField.percent}%)`);

  type Row = {
    title: string;
    category: string;
    fieldId: FieldId;
    categoryFit: number;
    vector: Record<TraitId, number>;
    contributions: { trait: TraitId; demand: number; userFit: number; contribution: number }[];
    weightedSum: number;
    weightTotal: number;
    traitCompatibility: number;
    rawMatch: number;
    matchPercent: number;
  };

  const rows: Row[] = careers.map((career) => {
    const fieldId = fieldForCategory(career.category);
    const categoryFit = fieldId ? fieldFit[fieldId] : 0;
    const vector = careerTraitVector(career);
    let weightedSum = 0;
    let weightTotal = 0;
    const contributions: Row["contributions"] = [];
    TRAITS.forEach((t) => {
      const demand = vector[t] / 100;
      const userFit = traitFit[t];
      const contribution = demand * userFit;
      weightedSum += contribution;
      weightTotal += demand;
      contributions.push({ trait: t, demand, userFit, contribution });
    });
    const traitCompatibility = weightTotal > 0 ? weightedSum / weightTotal : 0;
    const rawMatch = categoryFit * 0.6 + traitCompatibility * 0.4;
    const matchPercent = Math.max(1, Math.min(97, Math.round(rawMatch * 100)));
    return {
      title: career.title,
      category: career.category,
      fieldId: (fieldId ?? "technology") as FieldId,
      categoryFit,
      vector,
      contributions,
      weightedSum,
      weightTotal,
      traitCompatibility,
      rawMatch,
      matchPercent,
    };
  });

  rows.sort((a, b) => b.rawMatch - a.rawMatch);

  // Cross-check: does our reimplementation's ranking match the real engine's?
  const realOrder = real.all.map((m) => m.catalogSlug);
  const reimplOrder = rows.map((r) => careers.find((c) => c.title === r.title)!.slug);
  const matches = realOrder.every((slug, i) => slug === reimplOrder[i]);
  console.log(`\nCross-check vs real scoreCareerDiscovery() ranking: ${matches ? "PASSED (identical order)" : "MISMATCH — reimplementation diverges from real engine!"}`);

  console.log(`\nTop 15 careers — full breakdown:\n`);
  rows.slice(0, 15).forEach((r, i) => {
    console.log(`#${i + 1}  ${r.title}  (${r.category} -> field: ${r.fieldId})`);
    console.log(`   categoryFit: ${(r.categoryFit * 100).toFixed(1)}%  (SHARED by every career in the "${r.fieldId}" field)`);
    console.log(`   Career trait vector:  ${TRAITS.map((t) => `${t}=${r.vector[t]}`).join(", ")}`);
    console.log(`   Per-trait contribution (demand x userFit, normalized by total demand):`);
    r.contributions
      .slice()
      .sort((a, b) => b.demand - a.demand)
      .forEach((c) => {
        const pctOfWeighted = r.weightedSum > 0 ? (c.contribution / r.weightedSum) * 100 : 0;
        console.log(
          `     ${TRAIT_LABELS[c.trait].padEnd(30)} demand=${(c.demand * 100).toFixed(0).padStart(3)}%  userFit=${(c.userFit * 100).toFixed(0).padStart(3)}%  contribution=${c.contribution.toFixed(4)}  (${pctOfWeighted.toFixed(1)}% of weighted sum)`,
        );
      });
    console.log(`   traitCompatibility = weightedSum(${r.weightedSum.toFixed(4)}) / weightTotal(${r.weightTotal.toFixed(4)}) = ${(r.traitCompatibility * 100).toFixed(2)}%`);
    console.log(`   rawMatch = categoryFit(${(r.categoryFit * 100).toFixed(1)}%) * 0.6 + traitCompatibility(${(r.traitCompatibility * 100).toFixed(2)}%) * 0.4 = ${(r.rawMatch * 100).toFixed(3)}%`);
    console.log(`   FINAL displayed matchPercent: ${r.matchPercent}%   (rank #${i + 1})`);
    console.log("");
  });

  // Clustering summary
  const top15Percents = rows.slice(0, 15).map((r) => r.matchPercent);
  const distinctTop15 = new Set(top15Percents).size;
  console.log(`Top 15 matchPercent values: [${top15Percents.join(", ")}]`);
  console.log(`Distinct values among Top 15: ${distinctTop15} / 15`);

  return rows;
}

// ── Vector-duplication census across the whole catalog ─────────────────────
function vectorDuplicationCensus() {
  console.log("\n" + "=".repeat(90));
  console.log("CATALOG-WIDE TRAIT VECTOR DUPLICATION CENSUS (independent of any user profile)");
  console.log("=".repeat(90));
  const careers = getCareers();
  const byVector = new Map<string, string[]>();
  careers.forEach((c) => {
    const v = careerTraitVector(c);
    const key = TRAITS.map((t) => v[t]).join(",");
    const list = byVector.get(key) ?? [];
    list.push(`${c.title} (${c.category})`);
    byVector.set(key, list);
  });
  const groups = [...byVector.entries()].sort((a, b) => b[1].length - a[1].length);
  console.log(`Total careers: ${careers.length}`);
  console.log(`Distinct trait vectors: ${byVector.size}`);
  console.log(`\nLargest duplicate-vector groups:`);
  groups
    .filter(([, list]) => list.length > 1)
    .slice(0, 12)
    .forEach(([key, list]) => {
      console.log(`  ${list.length} careers share vector [${key}]:`);
      list.forEach((name) => console.log(`      - ${name}`));
    });

  console.log(`\nCategory -> Field collapse (categoryFit is shared across ALL careers in a field):`);
  const byField = new Map<FieldId, number>();
  careers.forEach((c) => {
    const fid = fieldForCategory(c.category);
    if (!fid) return;
    byField.set(fid, (byField.get(fid) ?? 0) + 1);
  });
  FIELDS.forEach((f) => {
    console.log(`  ${f.label.padEnd(34)} categories=[${f.categories.join(", ")}]  careers sharing this field's categoryFit=${byField.get(f.id) ?? 0}`);
  });
}

// ── Synthetic profiles (reusing the SAME real personas already verified in
// scoring.test.ts — not invented fresh, so results are directly comparable
// to the existing regression-test baseline). ──

const userA_technicalAnalytical: DiscoveryAnswers = {
  fieldInterest: "technology",
  excitingActivity: "research_analyze",
  favoriteSubjects: "math_analytics",
  problemSolvingStyle: "logic_analysis",
  peopleOrientation: "independent",
  strengths: ["analytical", "technical"],
  motivation: "discovery",
  values: "intellectual_challenge",
  learningStyle: "reading",
  educationLevel: "graduate",
  fieldOfStudyOrWork: "technology",
  technicalConfidence: "5",
  learningAgilityLevel: "4",
  communicationConfidenceLevel: "3",
  growthAreas: ["communication"],
  workEnvironmentPreference: "remote_independent",
  workPace: "flexible_self_paced",
  structurePreference: "mix_of_both",
  goalHorizon: "launching_a_career",
  organizationInterest: ["a", "b"],
};

const userB_creativeCommunication: DiscoveryAnswers = {
  fieldInterest: "design_creative",
  excitingActivity: "design_visually",
  favoriteSubjects: "design_arts",
  problemSolvingStyle: "creativity",
  peopleOrientation: "team_collab",
  strengths: ["creativity", "communication"],
  motivation: "innovation",
  values: "creative_freedom",
  learningStyle: "videos",
  educationLevel: "undergraduate",
  fieldOfStudyOrWork: "design_creative",
  technicalConfidence: "3",
  learningAgilityLevel: "4",
  communicationConfidenceLevel: "4",
  growthAreas: ["technical"],
  workEnvironmentPreference: "hybrid",
  workPace: "flexible_self_paced",
  structurePreference: "creative_freedom",
  goalHorizon: "launching_a_career",
};

const userC_leadershipBusiness: DiscoveryAnswers = {
  fieldInterest: "business",
  excitingActivity: "lead_grow",
  favoriteSubjects: "business_economics",
  problemSolvingStyle: "collaborating",
  peopleOrientation: "team_collab",
  strengths: ["leadership", "communication"],
  motivation: "leadership_recognition",
  values: "financial_growth",
  learningStyle: "group",
  educationLevel: "working_professional",
  fieldOfStudyOrWork: "business",
  technicalConfidence: "3",
  learningAgilityLevel: "4",
  communicationConfidenceLevel: "5",
  growthAreas: ["technical"],
  workEnvironmentPreference: "office_team",
  workPace: "fast_paced",
  structurePreference: "mix_of_both",
  goalHorizon: "advancing_or_switching",
};

fullBreakdown(userA_technicalAnalytical, null, "User A — strong technical/analytical (= dataScience persona in scoring.test.ts)");
fullBreakdown(userB_creativeCommunication, null, "User B — strong creative/communication (= design persona in scoring.test.ts)");
fullBreakdown(userC_leadershipBusiness, null, "User C — strong leadership/business (= business persona in scoring.test.ts)");
vectorDuplicationCensus();

// ── ILLUSTRATIVE ONLY — NOT IMPLEMENTED, NOT USED BY THE REAL ENGINE ──
// A hypothetical alternative traitCompatibility aggregation (demand-squared
// weighting instead of linear weighted-average), computed here purely to
// show, with real numbers on the SAME user profile, what a mathematically-
// principled formula change would do to the Top-15 spread. This does NOT
// touch scoring.ts and is not used anywhere in the app.
console.log("\n" + "=".repeat(90));
console.log("ILLUSTRATIVE ONLY — hypothetical alternative formula, NOT implemented, NOT used by the app");
console.log("Current:      traitCompatibility = sum(demand_t * userFit_t) / sum(demand_t)");
console.log("Alternative:  traitCompatibility = sum(demand_t^2 * userFit_t) / sum(demand_t^2)");
console.log("(Squaring the weights suppresses every career's near-universal 25-45% 'floor' traits");
console.log(" relative to its own top 2-3 differentiating traits, without adding any new signal,");
console.log(" hardcoding, or per-career special-casing — same inputs, different aggregation.)");
console.log("=".repeat(90));

function illustrateAlternative(basic: DiscoveryAnswers, label: string) {
  const { fieldFit, traitFit } = computeFitVectors(basic, null);
  const careers = getCareers();
  const rows = careers.map((career) => {
    const fieldId = fieldForCategory(career.category);
    const categoryFit = fieldId ? fieldFit[fieldId] : 0;
    const vector = careerTraitVector(career);
    let currentWeightedSum = 0;
    let currentWeightTotal = 0;
    let altWeightedSum = 0;
    let altWeightTotal = 0;
    TRAITS.forEach((t) => {
      const demand = vector[t] / 100;
      const userFit = traitFit[t];
      currentWeightedSum += demand * userFit;
      currentWeightTotal += demand;
      altWeightedSum += demand * demand * userFit;
      altWeightTotal += demand * demand;
    });
    const currentCompat = currentWeightTotal > 0 ? currentWeightedSum / currentWeightTotal : 0;
    const altCompat = altWeightTotal > 0 ? altWeightedSum / altWeightTotal : 0;
    const currentRaw = categoryFit * 0.6 + currentCompat * 0.4;
    const altRaw = categoryFit * 0.6 + altCompat * 0.4;
    return {
      title: career.title,
      currentPercent: Math.max(1, Math.min(97, Math.round(currentRaw * 100))),
      altPercent: Math.max(1, Math.min(97, Math.round(altRaw * 100))),
      currentRaw,
      altRaw,
    };
  });
  rows.sort((a, b) => b.currentRaw - a.currentRaw);
  const top15 = rows.slice(0, 15);
  console.log(`\n${label}`);
  console.log("  Rank  Career                          Current%  Alternative%");
  top15.forEach((r, i) => console.log(`  #${(i + 1).toString().padEnd(4)} ${r.title.padEnd(32)} ${r.currentPercent.toString().padStart(3)}%      ${r.altPercent.toString().padStart(3)}%`));
  const currentDistinct = new Set(top15.map((r) => r.currentPercent)).size;
  const altRowsSortedByAlt = rows.slice().sort((a, b) => b.altRaw - a.altRaw).slice(0, 15);
  const altDistinct = new Set(altRowsSortedByAlt.map((r) => r.altPercent)).size;
  console.log(`  Distinct values in current Top 15 (by current formula): ${currentDistinct}/15`);
  console.log(`  Distinct values if re-ranked by alternative formula's own Top 15: ${altDistinct}/15`);
}

illustrateAlternative(userA_technicalAnalytical, "User A — strong technical/analytical");
illustrateAlternative(userB_creativeCommunication, "User B — strong creative/communication");
illustrateAlternative(userC_leadershipBusiness, "User C — strong leadership/business");

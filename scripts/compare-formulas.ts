/*
 * READ-ONLY comparison harness — evaluates 3 candidate scoring formulas
 * against the CURRENT production formula, on 3 synthetic personas.
 *
 * Does NOT modify scoring.ts / traits.ts / fields.ts. Reads the real catalog
 * and real trait vectors, reimplements the field/trait accumulation exactly
 * as scoring.ts does it (cross-checked against the real scoreCareerDiscovery()
 * output), then computes 5 parallel scoring variants (current + A + B + C + D)
 * from the SAME underlying numbers.
 *
 * Run: npx tsx scripts/compare-formulas.ts
 */

import { getCareers } from "../src/lib/careers/catalog";
import { careerTraitVector, TRAITS, TRAIT_LABELS } from "../src/features/assessment/discovery/traits";
import { FIELDS, fieldForCategory } from "../src/features/assessment/discovery/fields";
import { BASIC_QUESTIONS, ADVANCED_QUESTIONS } from "../src/features/assessment/discovery/questions";
import { scoreCareerDiscovery } from "../src/features/assessment/discovery/scoring";
import type { DiscoveryAnswers, DiscoveryQuestion, FieldId, TraitId } from "../src/features/assessment/discovery/types";

// ── Reimplementation of scoring.ts's field/trait accumulation (read-only) ──
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
function applyOption(question: DiscoveryQuestion, optionValue: string, fieldScores: FieldScoreMap, traitScores: TraitScoreMap) {
  const option = question.options.find((o) => o.value === optionValue);
  if (!option) return;
  if (option.fieldWeights) (Object.entries(option.fieldWeights) as [FieldId, number][]).forEach(([f, amt]) => (fieldScores[f] += amt));
  if (option.traitWeights) (Object.entries(option.traitWeights) as [TraitId, number][]).forEach(([t, amt]) => (traitScores[t] += amt));
}
function accumulatePotential(question: DiscoveryQuestion, fieldPotential: FieldScoreMap, traitPotential: TraitScoreMap) {
  if (question.options.length === 0) return;
  FIELDS.forEach((f) => (fieldPotential[f.id] += Math.max(0, ...question.options.map((o) => o.fieldWeights?.[f.id] ?? 0))));
  TRAITS.forEach((t) => (traitPotential[t] += Math.max(0, ...question.options.map((o) => o.traitWeights?.[t] ?? 0))));
}
function scoreAnswers(questions: DiscoveryQuestion[], answers: DiscoveryAnswers, fieldScores: FieldScoreMap, traitScores: TraitScoreMap, fieldPotential: FieldScoreMap, traitPotential: TraitScoreMap) {
  questions.forEach((question) => {
    if (question.options.length > 0) accumulatePotential(question, fieldPotential, traitPotential);
    const answer = answers[question.id];
    if (answer == null) return;
    if (Array.isArray(answer)) answer.forEach((v) => applyOption(question, String(v), fieldScores, traitScores));
    else applyOption(question, String(answer), fieldScores, traitScores);
  });
}
function applyOrgEngagement(answers: DiscoveryAnswers, fieldScores: FieldScoreMap, fieldPotential: FieldScoreMap) {
  const fieldAnswer = answers.fieldInterest;
  const orgAnswer = answers.organizationInterest;
  if (typeof fieldAnswer !== "string" || !(fieldAnswer in fieldScores)) return;
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
  FIELDS.forEach((f) => (fieldFit[f.id] = fieldPotential[f.id] > 0 ? Math.min(1, Math.max(0, fieldScores[f.id] / fieldPotential[f.id])) : 0));
  const traitFit = {} as Record<TraitId, number>;
  TRAITS.forEach((t) => (traitFit[t] = traitPotential[t] > 0 ? Math.min(1, Math.max(0, traitScores[t] / traitPotential[t])) : 0));
  return { fieldFit, traitFit };
}

// ── Category-typical vectors (derived ENTIRELY from existing catalog data —
// no new inputs, no new questions: the average trait vector of every career
// that already shares a given catalog `category`). ──
function buildCategoryTypicalVectors(): Record<string, Record<TraitId, number>> {
  const careers = getCareers();
  const byCategory = new Map<string, Record<TraitId, number>[]>();
  careers.forEach((c) => {
    const v = careerTraitVector(c);
    const list = byCategory.get(c.category) ?? [];
    list.push(v);
    byCategory.set(c.category, list);
  });
  const out: Record<string, Record<TraitId, number>> = {};
  byCategory.forEach((vectors, category) => {
    const avg = {} as Record<TraitId, number>;
    TRAITS.forEach((t) => {
      avg[t] = vectors.reduce((sum, v) => sum + v[t], 0) / vectors.length;
    });
    out[category] = avg;
  });
  return out;
}

function dot(a: number[], b: number[]): number {
  return a.reduce((sum, v, i) => sum + v * b[i]!, 0);
}
function norm(a: number[]): number {
  return Math.sqrt(dot(a, a));
}
function cosineSim(a: number[], b: number[]): number {
  const na = norm(a);
  const nb = norm(b);
  if (na === 0 || nb === 0) return 0;
  return Math.max(0, dot(a, b) / (na * nb)); // clamp negative (shouldn't occur, all values >=0) for safety
}

// ── The 5 scoring variants (current + 3 candidates + 1 combined) ──────────
type Variant = "current" | "A" | "B" | "C" | "D";

function clampPercent(rawMatch: number): number {
  return Math.max(1, Math.min(97, Math.round(rawMatch * 100)));
}

function computeAllVariants(
  basic: DiscoveryAnswers,
  categoryTypical: Record<string, Record<TraitId, number>>,
) {
  const { fieldFit, traitFit } = computeFitVectors(basic, null);
  const careers = getCareers();
  const userFitVec = TRAITS.map((t) => traitFit[t]);

  const rows = careers.map((career) => {
    const fieldId = fieldForCategory(career.category);
    const fieldFitVal = fieldId ? fieldFit[fieldId] : 0;
    const vector = careerTraitVector(career);
    const demandVec = TRAITS.map((t) => vector[t] / 100);

    // current: linear weighted average, categoryFit = fieldFit
    let ws = 0, wt = 0;
    TRAITS.forEach((t) => {
      const d = vector[t] / 100;
      ws += d * traitFit[t];
      wt += d;
    });
    const currentTraitCompat = wt > 0 ? ws / wt : 0;
    const currentRaw = fieldFitVal * 0.6 + currentTraitCompat * 0.4;

    // A: category-blended categoryFit (fieldFit*0.7 + cosine(userFit, categoryTypical)*0.3), trait term = current formula
    const catTypical = categoryTypical[career.category];
    const catTypicalVec = catTypical ? TRAITS.map((t) => catTypical[t] / 100) : demandVec;
    const catSim = cosineSim(userFitVec, catTypicalVec);
    const categoryFit_A = fieldFitVal * 0.7 + catSim * 0.3;
    const rawA = categoryFit_A * 0.6 + currentTraitCompat * 0.4;

    // B: cosine-similarity trait term, categoryFit = current field-based
    const traitCompat_B = cosineSim(demandVec, userFitVec);
    const rawB = fieldFitVal * 0.6 + traitCompat_B * 0.4;

    // C: top-4-discriminative-trait weighted average, categoryFit = current field-based
    const topK = 4;
    const topTraits = ([...TRAITS] as TraitId[]).slice().sort((a, b) => vector[b] - vector[a]).slice(0, topK);
    let wsK = 0, wtK = 0;
    topTraits.forEach((t) => {
      const d = vector[t] / 100;
      wsK += d * traitFit[t];
      wtK += d;
    });
    const traitCompat_C = wtK > 0 ? wsK / wtK : 0;
    const rawC = fieldFitVal * 0.6 + traitCompat_C * 0.4;

    // D: combined — category-blended categoryFit (A) + top-4 discriminative trait term (C)
    const rawD = categoryFit_A * 0.6 + traitCompat_C * 0.4;

    return {
      title: career.title,
      category: career.category,
      fieldId: fieldId ?? "technology",
      current: { raw: currentRaw, pct: clampPercent(currentRaw) },
      A: { raw: rawA, pct: clampPercent(rawA), categoryFit: categoryFit_A, catSim },
      B: { raw: rawB, pct: clampPercent(rawB), traitCompat: traitCompat_B },
      C: { raw: rawC, pct: clampPercent(rawC), traitCompat: traitCompat_C, topTraits },
      D: { raw: rawD, pct: clampPercent(rawD) },
    };
  });

  return rows;
}

function summarizeVariant(rows: ReturnType<typeof computeAllVariants>, variant: Variant, label: string) {
  const sorted = rows.slice().sort((a, b) => b[variant].raw - a[variant].raw);
  const top15 = sorted.slice(0, 15);
  const percents = top15.map((r) => r[variant].pct);
  const distinct = new Set(percents).size;
  console.log(`\n  [${label}]`);
  top15.forEach((r, i) => console.log(`    #${(i + 1).toString().padEnd(3)} ${r.title.padEnd(30)} ${r[variant].pct}%   (${r.category})`));
  console.log(`    Distinct values: ${distinct}/15   Range: ${Math.min(...percents)}-${Math.max(...percents)}%`);
  return { top15, distinct, percents };
}

function runPersona(basic: DiscoveryAnswers, label: string, categoryTypical: Record<string, Record<TraitId, number>>) {
  console.log("\n" + "=".repeat(100));
  console.log(`PERSONA: ${label}`);
  console.log("=".repeat(100));
  const rows = computeAllVariants(basic, categoryTypical);
  summarizeVariant(rows, "current", "CURRENT (production formula)");
  summarizeVariant(rows, "A", "FORMULA A — category-blended categoryFit");
  summarizeVariant(rows, "B", "FORMULA B — cosine-similarity trait compatibility");
  summarizeVariant(rows, "C", "FORMULA C — top-4 discriminative-trait compatibility");
  summarizeVariant(rows, "D", "FORMULA D — combined (A's categoryFit + C's trait term)");
  return rows;
}

// ── Personas (identical to the ones already used/verified in scoring.test.ts) ──
const userA_technicalAnalytical: DiscoveryAnswers = {
  fieldInterest: "technology", excitingActivity: "research_analyze", favoriteSubjects: "math_analytics",
  problemSolvingStyle: "logic_analysis", peopleOrientation: "independent", strengths: ["analytical", "technical"],
  motivation: "discovery", values: "intellectual_challenge", learningStyle: "reading", educationLevel: "graduate",
  fieldOfStudyOrWork: "technology", technicalConfidence: "5", learningAgilityLevel: "4", communicationConfidenceLevel: "3",
  growthAreas: ["communication"], workEnvironmentPreference: "remote_independent", workPace: "flexible_self_paced",
  structurePreference: "mix_of_both", goalHorizon: "launching_a_career", organizationInterest: ["a", "b"],
};
const userB_creativeCommunication: DiscoveryAnswers = {
  fieldInterest: "design_creative", excitingActivity: "design_visually", favoriteSubjects: "design_arts",
  problemSolvingStyle: "creativity", peopleOrientation: "team_collab", strengths: ["creativity", "communication"],
  motivation: "innovation", values: "creative_freedom", learningStyle: "videos", educationLevel: "undergraduate",
  fieldOfStudyOrWork: "design_creative", technicalConfidence: "3", learningAgilityLevel: "4", communicationConfidenceLevel: "4",
  growthAreas: ["technical"], workEnvironmentPreference: "hybrid", workPace: "flexible_self_paced",
  structurePreference: "creative_freedom", goalHorizon: "launching_a_career",
};
const userC_leadershipBusiness: DiscoveryAnswers = {
  fieldInterest: "business", excitingActivity: "lead_grow", favoriteSubjects: "business_economics",
  problemSolvingStyle: "collaborating", peopleOrientation: "team_collab", strengths: ["leadership", "communication"],
  motivation: "leadership_recognition", values: "financial_growth", learningStyle: "group", educationLevel: "working_professional",
  fieldOfStudyOrWork: "business", technicalConfidence: "3", learningAgilityLevel: "4", communicationConfidenceLevel: "5",
  growthAreas: ["technical"], workEnvironmentPreference: "office_team", workPace: "fast_paced",
  structurePreference: "mix_of_both", goalHorizon: "advancing_or_switching",
};

const categoryTypical = buildCategoryTypicalVectors();

console.log("Category-typical vectors sample (Technology vs Data & AI — this is the split Formula A targets):");
console.log("  Technology:", JSON.stringify(Object.fromEntries(TRAITS.map((t) => [t, Math.round(categoryTypical["Technology"]![t])]))));
console.log("  Data & AI: ", JSON.stringify(Object.fromEntries(TRAITS.map((t) => [t, Math.round(categoryTypical["Data & AI"]![t])]))));
console.log("  Business:  ", JSON.stringify(Object.fromEntries(TRAITS.map((t) => [t, Math.round(categoryTypical["Business"]![t])]))));
console.log("  Finance:   ", JSON.stringify(Object.fromEntries(TRAITS.map((t) => [t, Math.round(categoryTypical["Finance"]![t])]))));

const rowsA = runPersona(userA_technicalAnalytical, "User A — technical/analytical", categoryTypical);
const rowsB = runPersona(userB_creativeCommunication, "User B — creative/communication", categoryTypical);
const rowsC = runPersona(userC_leadershipBusiness, "User C — leadership/business", categoryTypical);

// ── Sanity checks: does the real engine's top pick stay reasonable under each variant? ──
console.log("\n" + "=".repeat(100));
console.log("SANITY / FAIRNESS CHECKS");
console.log("=".repeat(100));

function checkTopCategoryStability(rows: ReturnType<typeof computeAllVariants>, expectedCategories: string[], label: string) {
  (["current", "A", "B", "C", "D"] as Variant[]).forEach((v) => {
    const top = rows.slice().sort((a, b) => b[v].raw - a[v].raw)[0]!;
    const ok = expectedCategories.includes(top.category);
    console.log(`  ${label} / ${v.padEnd(16)} top pick: ${top.title.padEnd(28)} (${top.category})  ${ok ? "OK" : "*** UNEXPECTED CATEGORY ***"}`);
  });
}
checkTopCategoryStability(rowsA, ["Technology", "Data & AI"], "User A");
checkTopCategoryStability(rowsB, ["Design"], "User B");
checkTopCategoryStability(rowsC, ["Business", "Finance", "Product & Management", "Marketing & Media"], "User C");

// ── Full-catalog distribution stats (not just Top 15) — checks whether any
// variant systematically shifts the OVERALL score level up/down (a sign of
// "inflation" rather than genuine differentiation). ──
function stats(nums: number[]) {
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
  return { min: Math.min(...nums), max: Math.max(...nums), mean: Math.round(mean * 10) / 10, stdev: Math.round(Math.sqrt(variance) * 10) / 10 };
}
function fullDistribution(rows: ReturnType<typeof computeAllVariants>, label: string) {
  console.log(`\n  Full-catalog (all ${rows.length} careers) distribution — ${label}:`);
  (["current", "A", "B", "C", "D"] as Variant[]).forEach((v) => {
    const pcts = rows.map((r) => r[v].pct);
    const s = stats(pcts);
    console.log(`    ${v.padEnd(10)} min=${s.min} max=${s.max} mean=${s.mean} stdev=${s.stdev}  distinctOverall=${new Set(pcts).size}/${rows.length}`);
  });
}
console.log("\n" + "=".repeat(100));
console.log("FULL-CATALOG DISTRIBUTION COMPARISON (all 118 careers, not just Top 15)");
console.log("=".repeat(100));
fullDistribution(rowsA, "User A");
fullDistribution(rowsB, "User B");
fullDistribution(rowsC, "User C");

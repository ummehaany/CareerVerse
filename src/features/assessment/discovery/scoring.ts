import { getCareers } from "@/lib/careers/catalog";
import type { Career } from "@/lib/careers/types";
import { FIELDS, FIELDS_BY_ID, fieldForCategory } from "./fields";
import { careerTraitVector, TRAITS } from "./traits";
import { BASIC_QUESTIONS, ADVANCED_QUESTIONS } from "./questions";
import type {
  CareerMatch,
  DiscoveryAnswers,
  DiscoveryQuestion,
  DiscoveryResult,
  FieldId,
  TraitId,
} from "./types";

/*
 * Career Discovery — scoring engine (v2): answers → dimensions → careers.
 *
 * Two accumulators, built the same way from the same answers:
 *  - fieldScores: which of the 9 broad worlds (fields.ts) the student's
 *    answers point to. This is what makes non-tech careers reachable.
 *  - traitScores: the student's profile across 11 cross-cutting work-style
 *    traits (traits.ts), used to differentiate careers *within* a field.
 *
 * Every career in the full `lib/careers/catalog.ts` (119 and counting) is
 * scored — never a hand-picked subset:
 *   categoryFit  = how strongly the student's field answers point at this
 *                  career's own catalog category (via fields.ts's mapping)
 *   traitFit     = weighted alignment between the student's trait profile and
 *                  this career's trait vector (derived automatically from its
 *                  catalog metadata by traits.ts — never hand-authored)
 *   matchPercent = round(categoryFit * 60 + traitFit * 40), capped below 100
 *
 * This percentage is on a shared 0–100 scale for every student — unlike the
 * v1 engine, it is NOT divided by "the best this student personally could
 * have scored," so it's honestly comparable and a scattered set of answers
 * will legitimately score lower rather than always reading ~99% on the top
 * pick. Field is weighted higher than trait specifically so a student who
 * clearly points at, say, Law & Public Service doesn't leak into Technology
 * results just because a couple of trait answers happened to overlap.
 */

type FieldScoreMap = Record<FieldId, number>;
type TraitScoreMap = Record<TraitId, number>;

function emptyFieldScores(): FieldScoreMap {
  const out = {} as FieldScoreMap;
  FIELDS.forEach((f) => {
    out[f.id] = 0;
  });
  return out;
}

function emptyTraitScoreMap(): TraitScoreMap {
  const out = {} as TraitScoreMap;
  TRAITS.forEach((t) => {
    out[t] = 0;
  });
  return out;
}

interface TraitContribution {
  trait: TraitId;
  label: string;
  amount: number;
  /** Excluded from "why this matches" driver text — its own field is already the lede. */
  citable: boolean;
}

function applyOption(
  question: DiscoveryQuestion,
  optionValue: string,
  fieldScores: FieldScoreMap,
  traitScores: TraitScoreMap,
  traitContributions: TraitContribution[],
) {
  const option = question.options.find((o) => o.value === optionValue);
  if (!option) return;
  if (option.fieldWeights) {
    (Object.entries(option.fieldWeights) as [FieldId, number][]).forEach(([fieldId, amount]) => {
      fieldScores[fieldId] += amount;
    });
  }
  if (option.traitWeights) {
    // The field-interest question's own option label ("Healthcare & Medicine")
    // reads awkwardly as a "strength" — it's already cited via `fieldLabel`.
    const citable = question.id !== "fieldInterest";
    (Object.entries(option.traitWeights) as [TraitId, number][]).forEach(([traitId, amount]) => {
      traitScores[traitId] += amount;
      traitContributions.push({ trait: traitId, label: option.label, amount, citable });
    });
  }
}

function accumulatePotential(
  question: DiscoveryQuestion,
  fieldPotential: FieldScoreMap,
  traitPotential: TraitScoreMap,
) {
  if (question.options.length === 0) return; // dynamic questions carry no static weights
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
  traitContributions: TraitContribution[],
) {
  questions.forEach((question) => {
    if (question.options.length > 0) accumulatePotential(question, fieldPotential, traitPotential);
    const answer = answers[question.id];
    if (answer == null) return;
    if (Array.isArray(answer)) {
      answer.forEach((v) => applyOption(question, String(v), fieldScores, traitScores, traitContributions));
    } else {
      applyOption(question, String(answer), fieldScores, traitScores, traitContributions);
    }
  });
}

/**
 * The organizations question (Q10) is field-locked and dynamic — a Healthcare
 * student only ever sees healthcare-shaped options. Selecting any of them
 * can't meaningfully redirect the field (there's nothing cross-field to pick),
 * so it contributes a small "conviction" reinforcement to the field the
 * student already chose, capped modestly so it never dominates.
 */
function applyOrganizationEngagement(
  answers: DiscoveryAnswers,
  fieldScores: FieldScoreMap,
  fieldPotential: FieldScoreMap,
) {
  const fieldAnswer = answers.fieldInterest;
  const orgAnswer = answers.organizationInterest;
  if (typeof fieldAnswer !== "string") return;
  if (!(fieldAnswer in fieldScores)) return;
  const count = Array.isArray(orgAnswer) ? orgAnswer.length : 0;
  const bonus = Math.min(count, 5);
  fieldScores[fieldAnswer as FieldId] += bonus;
  fieldPotential[fieldAnswer as FieldId] += 5;
}

function toPhrase(label: string): string {
  // Fully lowercase — several option labels are Title Case noun phrases
  // ("Business & Economics") that read oddly mid-sentence otherwise.
  return label.replace(/[.?!]+$/g, "").toLowerCase();
}

function joinPhrase(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function explanationFor(career: Career, fieldLabel: string, traitDriverLabels: string[], matchPercent: number): string {
  const whatDoes = career.whatDoes.replace(/\.$/, "").toLowerCase();
  const strengthPhrase = traitDriverLabels.length ? joinPhrase(traitDriverLabels.map(toPhrase)) : null;
  const lede = strengthPhrase
    ? `Your interest in ${fieldLabel} and strengths in ${strengthPhrase}`
    : `Your interest in ${fieldLabel}`;
  const strength = matchPercent >= 75 ? "strongly align with" : matchPercent >= 55 ? "align well with" : "could be worth exploring alongside";
  // "UI/UX" etc. sound like consonants ("you-eye") despite starting with a vowel letter.
  const consonantSoundingVowel = /^u[ix]\b/i.test(career.title);
  const article = /^[aeiou]/i.test(career.title) && !consonantSoundingVowel ? "an" : "a";
  return `${lede} ${strength} what ${article} ${career.title} does: ${whatDoes}.`;
}

export function scoreCareerDiscovery(
  basicAnswers: DiscoveryAnswers,
  advancedAnswers: DiscoveryAnswers | null,
): DiscoveryResult {
  const fieldScores = emptyFieldScores();
  const traitScores = emptyTraitScoreMap();
  const fieldPotential = emptyFieldScores();
  const traitPotential = emptyTraitScoreMap();
  const traitContributions: TraitContribution[] = [];

  scoreAnswers(BASIC_QUESTIONS, basicAnswers, fieldScores, traitScores, fieldPotential, traitPotential, traitContributions);
  if (advancedAnswers) {
    scoreAnswers(ADVANCED_QUESTIONS, advancedAnswers, fieldScores, traitScores, fieldPotential, traitPotential, traitContributions);
  }
  applyOrganizationEngagement(basicAnswers, fieldScores, fieldPotential);

  const fieldFit = {} as Record<FieldId, number>;
  FIELDS.forEach((f) => {
    fieldFit[f.id] = fieldPotential[f.id] > 0 ? Math.min(1, Math.max(0, fieldScores[f.id] / fieldPotential[f.id])) : 0;
  });

  const traitFit = {} as Record<TraitId, number>;
  TRAITS.forEach((t) => {
    traitFit[t] = traitPotential[t] > 0 ? Math.min(1, Math.max(0, traitScores[t] / traitPotential[t])) : 0;
  });

  const contributionsByTrait = new Map<TraitId, TraitContribution[]>();
  traitContributions.forEach((c) => {
    const list = contributionsByTrait.get(c.trait) ?? [];
    list.push(c);
    contributionsByTrait.set(c.trait, list);
  });

  const scored: Array<{ match: CareerMatch; rawMatch: number }> = getCareers().map((career) => {
    const fieldId = fieldForCategory(career.category);
    const categoryFit = fieldId ? fieldFit[fieldId] : 0;

    const vector = careerTraitVector(career);
    // traitCompatibility (Formula C, approved 2026-08-15): averaged over only
    // this career's own top-4 highest-demand traits, instead of all 11.
    // Every career's vector carries a non-zero "floor" (~25-45) on traits
    // that aren't actually central to it (see traits.ts) — averaging across
    // all 11 diluted every career's score against those floor traits the
    // student was never even measured as strong or weak on, which is what
    // compressed the Top 15 into a 1-2 percentage-point band regardless of
    // which career actually fit best (see the 2026-08-15 clustering
    // investigation). Restricting the average to each career's own top-4
    // discriminative traits keeps the score driven by what actually defines
    // that career, not by traits it barely needs. `weightTotal`'s formula is
    // otherwise unchanged (still demand-weighted, still 0-1 normalized), and
    // the 0.6/0.4 field/trait split and 1-97 clamp below are untouched.
    const discriminativeTraits = ([...TRAITS] as TraitId[])
      .slice()
      .sort((a, b) => vector[b] - vector[a])
      .slice(0, 4);
    let weightedSum = 0;
    let weightTotal = 0;
    discriminativeTraits.forEach((t) => {
      const demand = vector[t] / 100;
      weightedSum += demand * traitFit[t];
      weightTotal += demand;
    });
    const traitCompatibility = weightTotal > 0 ? weightedSum / weightTotal : 0;

    const rawMatch = categoryFit * 0.6 + traitCompatibility * 0.4;
    const matchPercent = Math.max(1, Math.min(97, Math.round(rawMatch * 100)));

    // Explain using this career's two most-demanded traits, where the student
    // also scored meaningfully — cite the actual answer label that drove it.
    const topTraits = ([...TRAITS] as TraitId[])
      .filter((t) => traitFit[t] > 0.35)
      .sort((a, b) => vector[b] - vector[a])
      .slice(0, 2);
    const traitDriverLabels = topTraits
      .map((t) => {
        const best = (contributionsByTrait.get(t) ?? [])
          .filter((c) => c.citable)
          .sort((a, b) => b.amount - a.amount)[0];
        return best?.label;
      })
      .filter((l): l is string => Boolean(l));

    const fieldLabel = fieldId ? FIELDS_BY_ID[fieldId].label : career.category;

    const match: CareerMatch = {
      id: career.slug,
      title: career.title,
      category: career.category,
      catalogSlug: career.slug,
      fieldId: fieldId ?? "technology",
      fieldLabel,
      matchPercent,
      explanation: explanationFor(career, fieldLabel, traitDriverLabels, matchPercent),
      drivers: traitDriverLabels.map(toPhrase),
    };
    return { match, rawMatch };
  });

  // Sort by the full-precision raw score, not the rounded/clamped display
  // percentage. Two careers in the same field commonly round to the exact
  // same integer `matchPercent` (e.g. 47%) even though one is a measurably
  // closer fit — sorting on the rounded value made that tie-break fall back
  // to the career catalog's arbitrary array order, which could rank a
  // strongly-signaled career (e.g. Data Scientist for an analytical/
  // research-leaning profile) below a same-field neighbor purely because of
  // catalog position. `matchPercent` itself is unchanged — this only fixes
  // ordering among careers that display the same rounded percentage.
  scored.sort((a, b) => b.rawMatch - a.rawMatch);
  const all: CareerMatch[] = scored.map((s) => s.match);

  const topFieldId = ([...FIELDS] as typeof FIELDS)
    .slice()
    .sort((a, b) => fieldFit[b.id] - fieldFit[a.id])[0]!.id;

  return {
    top: all.slice(0, 3),
    all,
    topField: { id: topFieldId, label: FIELDS_BY_ID[topFieldId].label, percent: Math.round(fieldFit[topFieldId] * 100) },
  };
}

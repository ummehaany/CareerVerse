import type { Career } from "@/lib/careers/types";
import type { TraitId, TraitWeights } from "./types";

/*
 * Trait vectors — deterministically derived from each career's *existing*
 * catalog metadata (category, title, skills, description). No trait is ever
 * hand-authored per career; add a career to the catalog and it automatically
 * gets a full trait profile from this function. This is what lets the engine
 * differentiate, say, Doctor vs. Surgeon vs. Nurse within Healthcare using
 * the same 11 traits it uses for Software Engineer vs. Product Designer.
 *
 * Each trait below documents *why* it fires, so the scoring stays auditable —
 * this is a keyword/category heuristic, not a black box.
 */

export const TRAITS: TraitId[] = [
  "analytical",
  "creative",
  "peopleHelping",
  "technical",
  "businessAcumen",
  "communication",
  "leadership",
  "independence",
  "structure",
  "riskTolerance",
  "responsibility",
];

export const TRAIT_LABELS: Record<TraitId, string> = {
  analytical: "Analytical thinking",
  creative: "Creativity",
  peopleHelping: "People & helping orientation",
  technical: "Technical / hands-on skill",
  businessAcumen: "Business acumen",
  communication: "Communication",
  leadership: "Leadership",
  independence: "Independence",
  structure: "Structure & process",
  riskTolerance: "Risk tolerance",
  responsibility: "Responsibility & accountability",
};

export type TraitVector = Record<TraitId, number>;

/**
 * Word-boundary prefix match — NOT plain substring `includes()`. Plain
 * substring matching is what caused real bugs during the recommendation
 * audit: "art" matched inside "ch-ART-ered accountant" (inflating its
 * creative score), and "advis" matched "advises" generically across any
 * advisory profession regardless of whether the work is actually caring/
 * empathetic (Lawyers, Corporate Lawyers, and Chartered Accountants all
 * incorrectly scored as high on peopleHelping as Doctors). `\b` anchors each
 * keyword to the *start* of a real word, so "art" no longer matches inside
 * "chartered" (no boundary before "art" there), while still matching
 * "art", "artist", "artistic".
 */
function has(text: string, ...words: string[]): boolean {
  return words.some((w) => new RegExp(`\\b${w}`).test(text));
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}

/**
 * A small, deterministic nudge from catalog fields that are already present
 * but were previously unused by trait derivation: `difficulty` (1–5, barrier
 * to entry) and `workLifeBalance` (1–5). These are what actually separate
 * Doctor (difficulty 5) from Nurse (3) or Paralegal (2) when their category
 * and much of their descriptive text otherwise overlap — keyword matching
 * alone can't make that distinction, but the catalog's own numbers already
 * encode it.
 */
function catalogIntensity(career: Career): number {
  const difficultyAdj = career.difficulty >= 4 ? 8 : career.difficulty <= 2 ? -8 : 0;
  const balanceAdj = career.workLifeBalance <= 2 ? 6 : 0;
  return difficultyAdj + balanceAdj;
}

/** A career's demand for each trait, 0–100, derived from catalog data. */
export function careerTraitVector(career: Career): TraitVector {
  const cat = career.category;
  const text = `${career.title} ${career.tagline} ${career.whatDoes} ${career.skills.join(" ")}`.toLowerCase();
  const intensity = catalogIntensity(career);

  // Diagnostic/scientific/legal/financial reasoning. ("design" deliberately
  // excluded — it over-matched "system design" on non-analytical roles.)
  const analytical = has(text, "data", "analy", "research", "scien", "statist", "audit", "account", "financ", "legal", "\\blaw\\b", "lawyer", "medical", "diagnos", "clinical", "chemistry", "pharmacol", "decision")
    ? 85
    : has(text, "engineer", "strateg")
      ? 60
      : 40;

  // Visual/verbal/conceptual creation. Specific, hands-on creative terms only
  // — bare "design" and "art" were matching "system design" and "chartered".
  const creative = has(text, "creativ", "illustrat", "storytell", "brand", "aesthetic", "artistic", "graphic", "animation", "visual")
    ? 85
    : cat === "Marketing & Media" || cat === "Design"
      ? 75
      : has(text, "content")
        ? 50
        : 30;

  // Caring for, teaching, or directly serving people. "advis" removed — it
  // matched any advisory profession (Lawyer, Accountant) regardless of
  // whether the work is actually empathetic/caring. "advoca" added for
  // human-rights/public-advocacy roles.
  const peopleHelping = has(text, "patient", "care", "empath", "teach", "counsel", "nurse", "student", "therap", "psycholog", "advoca", "community")
    ? 88
    : cat === "Healthcare" || cat === "Education"
      ? 80
      : has(text, "customer", "service")
        ? 55
        : 25;

  // Building/engineering/hands-on systems work. Bare "program"/"software"/
  // "system" removed — they matched "government programs", "legal
  // software", and "design systems" on non-technical roles. Physical/manual/
  // procedural clinical skill ("dexterity", "surgical", "anatomy", "manual",
  // "imaging", "lab", "clinical") added — without it, every Healthcare career
  // defaulted to the same technical:25, so a hands-on role like Surgeon or
  // Dentist was indistinguishable from a purely verbal/behavioral one like
  // Psychologist on this trait. This is what let Doctor, Nurse, Dentist,
  // Physiotherapist, Surgeon, Radiologist, and Veterinarian all tie
  // Psychologist for a student whose answers signal people/communication
  // strength but no technical/hands-on preference: those roles' own high
  // technical demand now works against them when the student's technical fit
  // is low, the same way structure/responsibility already did.
  const technical = has(text, "programming", "coding", "cad", "construction", "mechanical", "electrical", "infrastructure", "hardware", "dexterity", "surgical", "anatomy", "manual", "imaging", "lab", "clinical")
    ? 85
    : cat === "Technology" || cat === "Data & AI" || cat === "Engineering"
      ? 75
      : 25;

  // Commercial/strategic/revenue-oriented work.
  const businessAcumen = has(text, "business", "strateg", "sales", "revenue", "market", "negotiat", "operations", "management", "finance", "client")
    ? 78
    : cat === "Business" || cat === "Finance" || cat === "Product & Management"
      ? 75
      : 30;

  // Writing, presenting, persuading, explaining.
  const communication = has(text, "communicat", "writ", "present", "teach", "journal", "negotiat", "advoca", "public")
    ? 85
    : cat === "Marketing & Media" || cat === "Law & Public" || cat === "Education"
      ? 75
      : 40;

  // Directing people, strategy, or an organization.
  const leadership = has(text, "lead", "manage", "director", "head", "principal", "chief", "found", "strateg")
    ? 80
    : cat === "Product & Management" || cat === "Business"
      ? 65
      : 35;

  // Autonomous, individually-driven work. The bare "research" trigger is
  // skipped for careers that already read as centrally interpersonal
  // (peopleHelping's top tier) — a role whose core purpose is direct,
  // ongoing care/advocacy for people (Psychologist, Human Rights Advocate)
  // isn't also "highly independent" just because "Research" is one of five
  // listed skills. Concretely: Psychologist's independence demand was 74 —
  // higher than Doctor's (47) — purely from that one word, which then
  // dragged its overall score down for exactly the people-facing students
  // most likely to be a genuine match, since a high-demand trait the student
  // has no signal for dilutes the weighted average more than a low-demand
  // one. "Writer"/"consult"/"freelance"/"architect"/"found" still count on
  // their own — those describe genuinely solo-practice work, not a shared
  // boilerplate skill entry.
  const independence = (peopleHelping < 88 && has(text, "research")) || has(text, "writer", "consult", "freelance", "analyst", "architect", "found")
    ? 70
    : cat === "Healthcare" || cat === "Education"
      ? 40
      : 50;

  // Regulated, protocol-driven, high-compliance work. "clinical" added — it
  // was previously missing, so Nurse (whose text says "clinical skills" but
  // never the literal word "medical") scored as less structured than Doctor
  // for no real reason.
  const structure = has(text, "regulat", "complian", "protocol", "procedure", "licens", "audit", "safety", "legal", "medical", "clinical", "government", "surgical")
    ? 85
    : cat === "Design" || cat === "Marketing & Media" || has(text, "startup", "entrepreneur")
      ? 35
      : 55;

  // Comfort with volatility, new ventures, unproven ground.
  const riskTolerance = has(text, "startup", "entrepreneur", "found", "venture", "trading", "growth")
    ? 80
    : cat === "Healthcare" || cat === "Law & Public" || cat === "Education"
      ? 25
      : 45;

  // High-stakes, ethical, or safety-critical accountability.
  const responsibility = has(text, "safety", "ethic", "complian", "medical", "legal", "licens", "patient", "surgical", "precision", "stamina", "accountab")
    ? 85
    : cat === "Healthcare" || cat === "Law & Public" || cat === "Engineering"
      ? 70
      : 45;

  return {
    analytical: clamp(analytical + intensity * 0.5),
    creative,
    peopleHelping,
    technical,
    businessAcumen,
    communication,
    leadership,
    independence: clamp(independence + intensity * 0.5),
    structure,
    riskTolerance,
    responsibility: clamp(responsibility + intensity),
  };
}

export function emptyTraitScores(): TraitVector {
  return {
    analytical: 0,
    creative: 0,
    peopleHelping: 0,
    technical: 0,
    businessAcumen: 0,
    communication: 0,
    leadership: 0,
    independence: 0,
    structure: 0,
    riskTolerance: 0,
    responsibility: 0,
  };
}

export function tw(weights: TraitWeights): TraitWeights {
  return weights;
}

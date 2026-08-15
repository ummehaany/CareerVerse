/*
 * READ-ONLY diagnostic — does not write to Firestore, does not modify any
 * app file, is not imported by the app anywhere. Run it locally with:
 *
 *   npx tsx scripts/diagnose-discovery-scoring.ts
 *
 * What it does:
 *  1. Tries to fetch YOUR most recent completed Career Discovery answers
 *     from Firestore, using the same service-account credentials already in
 *     your local .env.local (firebase-admin, read-only: only .get() calls).
 *  2. If that fails (no network, no doc found, etc.) it falls back to
 *     reading answers from scripts/my-discovery-answers.json, which you can
 *     hand-fill (a template is printed if the file doesn't exist).
 *  3. Recomputes the full scoring breakdown — fieldScores, traitScores,
 *     fieldPotential, traitPotential, fieldFit, traitFit, categoryFit,
 *     traitCompatibility, raw score, matchPercent — for every career in the
 *     catalog, using the SAME exported functions the real app uses
 *     (getCareers, careerTraitVector, fieldForCategory, BASIC_QUESTIONS,
 *     ADVANCED_QUESTIONS). The only thing this script re-implements is the
 *     answer-accumulation loop itself (fieldScores/traitScores/potentials)
 *     and the traitCompatibility aggregation, because scoring.ts doesn't
 *     currently export those intermediate values. As of 2026-08-15, the
 *     traitCompatibility step mirrors "Formula C" (approved production
 *     change): each career's traitCompatibility is now averaged over only
 *     its own top-4 highest-demand traits, not all 11 — this script's
 *     reimplementation was updated to match so the cross-check below stays
 *     meaningful.
 *  4. Cross-checks that re-implementation against the REAL, unmodified
 *     `scoreCareerDiscovery()` — if the two don't produce the same ranking,
 *     the script says so loudly instead of silently showing you numbers
 *     that might not match what the app actually did.
 *  5. Prints field scores, trait scores, the Top 20 with a full breakdown,
 *     and detailed trait vectors for Site Reliability Engineer, BI Analyst,
 *     Data Scientist, ML Engineer, Data Analyst, Data Engineer, and AI
 *     Engineer specifically.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getCareers, getCareer } from "../src/lib/careers/catalog";
import type { Career } from "../src/lib/careers/types";
import { FIELDS, FIELDS_BY_ID, fieldForCategory } from "../src/features/assessment/discovery/fields";
import { careerTraitVector, TRAITS, TRAIT_LABELS } from "../src/features/assessment/discovery/traits";
import { BASIC_QUESTIONS, ADVANCED_QUESTIONS } from "../src/features/assessment/discovery/questions";
import { scoreCareerDiscovery } from "../src/features/assessment/discovery/scoring";
import type { DiscoveryAnswers, DiscoveryQuestion, FieldId, TraitId } from "../src/features/assessment/discovery/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ANSWERS_FILE = path.join(__dirname, "my-discovery-answers.json");

// ── 1. Get real answers: Firestore first, local JSON file fallback ────────

async function loadEnvLocal(): Promise<Record<string, string>> {
  const envPath = path.join(__dirname, "..", ".env.local");
  const out: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return out;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
    if (m) out[m[1]!] = m[2]!;
  }
  return out;
}

interface LoadedAnswers {
  basicAnswers: DiscoveryAnswers;
  advancedAnswers: DiscoveryAnswers | null;
  source: string;
}

async function tryFirestore(): Promise<LoadedAnswers | null> {
  try {
    const env = await loadEnvLocal();
    const projectId = env.FIREBASE_PROJECT_ID;
    const clientEmail = env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
    if (!projectId || !clientEmail || !privateKey) return null;

    const admin = await import("firebase-admin");
    const app = admin.default.apps.length
      ? admin.default.app()
      : admin.default.initializeApp({ credential: admin.default.credential.cert({ projectId, clientEmail, privateKey }) });
    const db = admin.default.firestore(app);

    // Read-only: collectionGroup query + .get(). No writes anywhere.
    const snap = await db
      .collectionGroup("assessments")
      .orderBy("updatedAt", "desc")
      .limit(15)
      .get();

    for (const doc of snap.docs) {
      const data = doc.data() as any;
      const discovery = data.careerDiscovery;
      if (discovery?.completed && discovery.basicAnswers) {
        console.log(`✓ Loaded answers from Firestore: users/${doc.ref.parent.parent?.id}/assessments/${doc.id}\n`);
        return {
          basicAnswers: discovery.basicAnswers as DiscoveryAnswers,
          advancedAnswers: (discovery.advancedAnswers ?? null) as DiscoveryAnswers | null,
          source: `Firestore (assessment ${doc.id})`,
        };
      }
    }
    console.log("Firestore reachable, but no completed Career Discovery document was found.\n");
    return null;
  } catch (err) {
    console.log(`Firestore not reachable from this machine/script (${err instanceof Error ? err.message : err}).\n`);
    return null;
  }
}

function loadFromFile(): LoadedAnswers | null {
  if (!fs.existsSync(ANSWERS_FILE)) {
    const template = {
      basicAnswers: Object.fromEntries(BASIC_QUESTIONS.map((q) => [q.id, q.type === "multi" ? ["FILL_ME"] : "FILL_ME"])),
      advancedAnswers: null,
    };
    fs.writeFileSync(ANSWERS_FILE, JSON.stringify(template, null, 2));
    console.log(`No Firestore data found. A template was written to:\n  ${ANSWERS_FILE}\nFill in your real answer values (see src/features/assessment/discovery/questions.ts for valid option values per question id) and re-run this script.\n`);
    return null;
  }
  const raw = JSON.parse(fs.readFileSync(ANSWERS_FILE, "utf8"));
  return { basicAnswers: raw.basicAnswers, advancedAnswers: raw.advancedAnswers ?? null, source: `local file (${ANSWERS_FILE})` };
}

// ── 2. Re-implementation of scoring.ts's accumulation loop (read-only,
//      mirrors the real algorithm so we can expose its intermediate state) ──

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
  if (option.fieldWeights) {
    (Object.entries(option.fieldWeights) as [FieldId, number][]).forEach(([fieldId, amount]) => (fieldScores[fieldId] += amount));
  }
  if (option.traitWeights) {
    (Object.entries(option.traitWeights) as [TraitId, number][]).forEach(([traitId, amount]) => (traitScores[traitId] += amount));
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
    if (Array.isArray(answer)) answer.forEach((v) => applyOption(question, String(v), fieldScores, traitScores));
    else applyOption(question, String(answer), fieldScores, traitScores);
  });
}

function applyOrganizationEngagement(answers: DiscoveryAnswers, fieldScores: FieldScoreMap, fieldPotential: FieldScoreMap) {
  const fieldAnswer = answers.fieldInterest;
  const orgAnswer = answers.organizationInterest;
  if (typeof fieldAnswer !== "string") return;
  if (!(fieldAnswer in fieldScores)) return;
  const count = Array.isArray(orgAnswer) ? orgAnswer.length : 0;
  const bonus = Math.min(count, 5);
  fieldScores[fieldAnswer as FieldId] += bonus;
  fieldPotential[fieldAnswer as FieldId] += 5;
}

interface Breakdown {
  career: Career;
  categoryFit: number;
  traitCompatibility: number;
  rawMatch: number;
  matchPercent: number;
  vector: Record<TraitId, number>;
}

function fullBreakdown(basicAnswers: DiscoveryAnswers, advancedAnswers: DiscoveryAnswers | null) {
  const fieldScores = emptyFieldScores();
  const traitScores = emptyTraitScoreMap();
  const fieldPotential = emptyFieldScores();
  const traitPotential = emptyTraitScoreMap();

  scoreAnswers(BASIC_QUESTIONS, basicAnswers, fieldScores, traitScores, fieldPotential, traitPotential);
  if (advancedAnswers) scoreAnswers(ADVANCED_QUESTIONS, advancedAnswers, fieldScores, traitScores, fieldPotential, traitPotential);
  applyOrganizationEngagement(basicAnswers, fieldScores, fieldPotential);

  const fieldFit = {} as Record<FieldId, number>;
  FIELDS.forEach((f) => (fieldFit[f.id] = fieldPotential[f.id] > 0 ? Math.min(1, Math.max(0, fieldScores[f.id] / fieldPotential[f.id])) : 0));

  const traitFit = {} as Record<TraitId, number>;
  TRAITS.forEach((t) => (traitFit[t] = traitPotential[t] > 0 ? Math.min(1, Math.max(0, traitScores[t] / traitPotential[t])) : 0));

  const breakdowns: Breakdown[] = getCareers().map((career) => {
    const fieldId = fieldForCategory(career.category);
    const categoryFit = fieldId ? fieldFit[fieldId] : 0;
    const vector = careerTraitVector(career);
    // Formula C (2026-08-15, approved production change to scoring.ts):
    // traitCompatibility now averages only each career's own top-4
    // highest-demand traits, not all 11. Mirrored here so this script's
    // reimplementation — and its cross-check below — stay faithful to the
    // real, current scoreCareerDiscovery().
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
    return { career, categoryFit, traitCompatibility, rawMatch, matchPercent, vector };
  });
  breakdowns.sort((a, b) => b.rawMatch - a.rawMatch);

  return { fieldScores, traitScores, fieldPotential, traitPotential, fieldFit, traitFit, breakdowns };
}

// ── 3. Run ──────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(78));
  console.log("Career Discovery scoring diagnostic — read-only");
  console.log("=".repeat(78), "\n");

  let loaded = await tryFirestore();
  if (!loaded) loaded = loadFromFile();
  if (!loaded) return;

  console.log(`Answer source: ${loaded.source}`);
  console.log(`Basic answers: ${Object.keys(loaded.basicAnswers).length} / ${BASIC_QUESTIONS.length}`);
  console.log(`Advanced answers: ${loaded.advancedAnswers ? Object.keys(loaded.advancedAnswers).length + " / " + ADVANCED_QUESTIONS.length : "none (basic-only)"}\n`);

  const { fieldScores, traitScores, fieldPotential, traitPotential, fieldFit, traitFit, breakdowns } = fullBreakdown(
    loaded.basicAnswers,
    loaded.advancedAnswers,
  );

  // Cross-check against the real, unmodified scoreCareerDiscovery().
  const real = scoreCareerDiscovery(loaded.basicAnswers, loaded.advancedAnswers);
  const realOrder = real.all.map((m) => m.catalogSlug).join(",");
  const reimplOrder = breakdowns.map((b) => b.career.slug).join(",");
  const matches = realOrder === reimplOrder;
  console.log(matches ? "✓ Cross-check PASSED — this script's internals exactly reproduce the app's real ranking.\n" : "⚠ Cross-check FAILED — this script's numbers may not match the app. Treat the breakdown below with caution and report this.\n");

  console.log("-".repeat(78));
  console.log("FIELD SCORES (raw / potential → fit %)");
  console.log("-".repeat(78));
  FIELDS.forEach((f) => {
    console.log(`  ${f.label.padEnd(32)} ${String(fieldScores[f.id]).padStart(4)} / ${String(fieldPotential[f.id]).padEnd(4)} → ${(fieldFit[f.id] * 100).toFixed(1)}%`);
  });
  console.log(`\n  topField: ${real.topField.label} (${real.topField.percent}%)\n`);

  console.log("-".repeat(78));
  console.log("TRAIT SCORES (raw / potential → fit %)");
  console.log("-".repeat(78));
  TRAITS.forEach((t) => {
    console.log(`  ${TRAIT_LABELS[t].padEnd(32)} ${String(traitScores[t]).padStart(4)} / ${String(traitPotential[t]).padEnd(4)} → ${(traitFit[t] * 100).toFixed(1)}%`);
  });

  console.log("\n" + "-".repeat(78));
  console.log("TOP 20 CAREERS");
  console.log("-".repeat(78));
  console.log(
    "Rank".padEnd(5) + "Career".padEnd(28) + "Category".padEnd(16) + "categoryFit".padEnd(12) + "traitFit".padEnd(10) + "Raw".padEnd(8) + "Match%",
  );
  breakdowns.slice(0, 20).forEach((b, i) => {
    console.log(
      String(i + 1).padEnd(5) +
        b.career.title.padEnd(28) +
        b.career.category.padEnd(16) +
        (b.categoryFit * 100).toFixed(1).padEnd(12) +
        (b.traitCompatibility * 100).toFixed(1).padEnd(10) +
        b.rawMatch.toFixed(4).padEnd(8) +
        b.matchPercent,
    );
  });

  console.log("\n" + "-".repeat(78));
  console.log("DETAILED TRAIT VECTORS — requested careers");
  console.log("-".repeat(78));
  const focusSlugs = ["site-reliability-engineer", "business-intelligence-analyst", "data-scientist", "ml-engineer", "data-analyst", "data-engineer", "ai-engineer"];
  for (const slug of focusSlugs) {
    const b = breakdowns.find((x) => x.career.slug === slug);
    if (!b) {
      console.log(`  ${slug}: not found in catalog`);
      continue;
    }
    const rank = breakdowns.indexOf(b) + 1;
    const usedTraits = new Set(
      ([...TRAITS] as TraitId[]).slice().sort((x, y) => b.vector[y] - b.vector[x]).slice(0, 4),
    );
    console.log(`\n  ${b.career.title} (${slug}) — rank #${rank}, ${b.matchPercent}%`);
    console.log(`    category: ${b.career.category} | categoryFit: ${(b.categoryFit * 100).toFixed(1)}% | traitFit(weighted, top-4 only — Formula C): ${(b.traitCompatibility * 100).toFixed(1)}%`);
    TRAITS.forEach((t) => {
      const marker = usedTraits.has(t) ? " <- used in Formula C (top-4 demand)" : "";
      console.log(`    ${TRAIT_LABELS[t].padEnd(32)} demand=${String(b.vector[t]).padStart(3)}  userFit=${(traitFit[t] * 100).toFixed(1)}%${marker}`);
    });
  }

  console.log("\n" + "=".repeat(78));
  console.log("Done. Copy this entire output back to Claude for analysis.");
  console.log("=".repeat(78));
}

main().catch((err) => {
  console.error("Diagnostic failed:", err);
  process.exit(1);
});

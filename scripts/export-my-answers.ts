/*
 * READ-ONLY export of YOUR actual, already-completed Career Discovery
 * answers. This is the ONLY thing this script does.
 *
 * It does NOT:
 *   - write to Firestore (only .get() / getUserByEmail() calls)
 *   - touch firestore.indexes.json or any Firebase config
 *   - modify scoring.ts, traits.ts, questions.ts, or ranking logic
 *   - modify any production document
 *
 * Why this avoids the earlier "index not necessary" error:
 * The previous diagnostic used a `collectionGroup("assessments")` query
 * across ALL users, which needs a collection-group index config. This
 * script instead looks up YOUR uid by email (Admin Auth, no index involved)
 * and reads directly from `users/{uid}/assessments` — a single collection,
 * single-field `orderBy`. That's exactly the same query
 * `getLatestAssessment()` already runs in
 * src/lib/firebase/firestore/assessments.ts for the live app, and Firestore
 * auto-creates single-field indexes for normal collection queries. No
 * firestore.indexes.json entry, no deploy, ever required.
 *
 * Usage:
 *   npx tsx scripts/export-my-answers.ts you@email.com
 *
 * Output:
 *   scripts/my-discovery-answers.json is overwritten ONLY if a real,
 *   completed set of answers is found. If nothing completed is found,
 *   the file is left untouched (so a placeholder never gets mistaken for
 *   real data) and the script says so explicitly.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "my-discovery-answers.json");

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

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/export-my-answers.ts you@email.com");
    process.exit(1);
  }

  const env = await loadEnvLocal();
  const projectId = env.FIREBASE_PROJECT_ID;
  const clientEmail = env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env.local — cannot connect.");
    process.exit(1);
  }

  const admin = await import("firebase-admin");
  const app = admin.default.apps.length
    ? admin.default.app()
    : admin.default.initializeApp({ credential: admin.default.credential.cert({ projectId, clientEmail, privateKey }) });
  const auth = admin.default.auth(app);
  const db = admin.default.firestore(app);

  // 1. Look up YOUR uid by email. Read-only Admin Auth call, no index involved.
  const user = await auth.getUserByEmail(email);
  console.log(`Found account: ${user.uid} (${user.email})`);

  // 2. Read directly from users/{uid}/assessments — same query the real app
  //    uses in getLatestAssessment(). Single collection, single-field
  //    orderBy: no index config needed.
  const snap = await db
    .collection("users")
    .doc(user.uid)
    .collection("assessments")
    .orderBy("updatedAt", "desc")
    .limit(1)
    .get();

  if (snap.empty) {
    console.log("No assessment document exists for this account yet. Nothing exported.");
    return;
  }

  const doc = snap.docs[0]!;
  const data = doc.data() as Record<string, unknown>;
  const discovery = data.careerDiscovery as
    | { completed?: boolean; basicAnswers?: unknown; advancedAnswers?: unknown }
    | undefined;

  if (!discovery?.completed || !discovery.basicAnswers) {
    console.log(
      `Assessment doc ${doc.id} found, but Career Discovery is not marked completed on it (or has no answers). ` +
        `Nothing exported — the existing placeholder file (if any) is left untouched, not treated as real data.`,
    );
    return;
  }

  const out = {
    basicAnswers: discovery.basicAnswers,
    advancedAnswers: discovery.advancedAnswers ?? null,
    _source: `users/${user.uid}/assessments/${doc.id}`,
    _exportedAt: new Date().toISOString(),
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
  console.log(`\n✓ Real answers exported to ${OUT_FILE}`);
  console.log(`  Source: users/${user.uid}/assessments/${doc.id}`);
  console.log(`  Basic answers: ${Object.keys(discovery.basicAnswers as object).length} fields`);
  console.log(`  Advanced answers: ${discovery.advancedAnswers ? "present" : "none"}`);
  console.log(`\nNext: npx tsx scripts/diagnose-discovery-scoring.ts`);
}

main().catch((err) => {
  console.error("Export failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});

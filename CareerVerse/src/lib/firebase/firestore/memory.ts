import { cache } from "react";
import { randomUUID } from "node:crypto";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import type {
  HidableField,
  LearningStyle,
  MemoryAugment,
  MemoryEvent,
  MemoryEventType,
  MemoryNote,
  MemoryOverrides,
} from "@/lib/memory/types";

/**
 * Persistence layer for the AI Memory "augment" document
 * (`users/{uid}/memory/augment`). This stores ONLY net-new memory that isn't
 * already derivable from the app's existing data. All writes are server-only
 * (Admin SDK) and bounded so a document can never grow without limit.
 */

const DOC = () => "augment";
function ref(uid: string) {
  return adminDb.collection("users").doc(uid).collection("memory").doc(DOC());
}

const CAP = { notes: 50, recommendations: 30, faqs: 25, weeklySnapshots: 12, events: 80 } as const;

function emptyAugment(): MemoryAugment {
  return {
    overrides: {},
    hiddenFields: [],
    notes: [],
    recommendations: [],
    faqs: [],
    weeklySnapshots: [],
    events: [],
  };
}

function normalize(data: Partial<MemoryAugment> | undefined): MemoryAugment {
  const base = emptyAugment();
  if (!data) return base;
  return {
    overrides: data.overrides ?? {},
    hiddenFields: Array.isArray(data.hiddenFields) ? data.hiddenFields : [],
    notes: Array.isArray(data.notes) ? data.notes : [],
    recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    faqs: Array.isArray(data.faqs) ? data.faqs : [],
    weeklySnapshots: Array.isArray(data.weeklySnapshots) ? data.weeklySnapshots : [],
    events: Array.isArray(data.events) ? data.events : [],
  };
}

async function getMemoryAugment__impl(uid: string): Promise<MemoryAugment> {
  try {
    const snap = await ref(uid).get();
    return normalize(snap.exists ? (snap.data() as Partial<MemoryAugment>) : undefined);
  } catch (error) {
    console.error("[memory] read augment failed:", error instanceof Error ? error.message : error);
    return emptyAugment();
  }
}

/** Request-memoized read of the augment document. */
export const getMemoryAugment = cache(getMemoryAugment__impl);

/** newest-first prepend + cap. */
function capPrepend<T>(list: T[], item: T, max: number): T[] {
  return [item, ...list].slice(0, max);
}

async function mutate(uid: string, fn: (a: MemoryAugment) => MemoryAugment): Promise<void> {
  const r = ref(uid);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(r);
    const current = normalize(snap.exists ? (snap.data() as Partial<MemoryAugment>) : undefined);
    const next = fn(current);
    tx.set(r, { ...next, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  });
}

/* ── Overrides & preferences ────────────────────────────────────────────────*/

export async function setMemoryOverride<K extends keyof MemoryOverrides>(
  uid: string,
  key: K,
  value: MemoryOverrides[K],
): Promise<void> {
  await mutate(uid, (a) => ({ ...a, overrides: { ...a.overrides, [key]: value } }));
}

export async function setLearningStyle(uid: string, style: LearningStyle): Promise<void> {
  await mutate(uid, (a) => ({ ...a, overrides: { ...a.overrides, learningStyle: style } }));
}

export async function setHiddenField(uid: string, field: HidableField, hidden: boolean): Promise<void> {
  await mutate(uid, (a) => {
    const set = new Set(a.hiddenFields);
    if (hidden) set.add(field);
    else set.delete(field);
    return { ...a, hiddenFields: Array.from(set) };
  });
}

/* ── Notes (user-authored memories) ─────────────────────────────────────────*/

export async function addMemoryNote(uid: string, text: string): Promise<MemoryNote> {
  const note: MemoryNote = { id: randomUUID(), text: text.trim().slice(0, 500), createdAt: new Date().toISOString() };
  await mutate(uid, (a) => ({ ...a, notes: capPrepend(a.notes, note, CAP.notes) }));
  return note;
}

export async function deleteMemoryNote(uid: string, id: string): Promise<void> {
  await mutate(uid, (a) => ({ ...a, notes: a.notes.filter((n) => n.id !== id) }));
}

/* ── AI recommendation log (so features can avoid repeating advice) ─────────*/

export async function addMemoryRecommendation(uid: string, text: string, source: string): Promise<void> {
  const t = text.trim();
  if (!t) return;
  await mutate(uid, (a) => {
    // Skip near-duplicates already logged recently.
    if (a.recommendations.some((r) => r.text.trim().toLowerCase() === t.toLowerCase())) return a;
    const rec = { id: randomUUID(), text: t.slice(0, 400), source, createdAt: new Date().toISOString() };
    return { ...a, recommendations: capPrepend(a.recommendations, rec, CAP.recommendations) };
  });
}

/* ── Frequently asked questions ─────────────────────────────────────────────*/

export async function recordFaq(uid: string, question: string): Promise<void> {
  const q = question.trim().slice(0, 200);
  if (!q) return;
  await mutate(uid, (a) => {
    const now = new Date().toISOString();
    const idx = a.faqs.findIndex((f) => f.question.trim().toLowerCase() === q.toLowerCase());
    let faqs = a.faqs.slice();
    if (idx >= 0) {
      faqs[idx] = { ...faqs[idx], count: faqs[idx].count + 1, lastAskedAt: now };
    } else {
      faqs = capPrepend(faqs, { id: randomUUID(), question: q, count: 1, lastAskedAt: now }, CAP.faqs);
    }
    faqs.sort((x, y) => y.count - x.count);
    return { ...a, faqs };
  });
}

/* ── Weekly health snapshots ────────────────────────────────────────────────*/

export async function addWeeklySnapshot(uid: string, healthScore: number, summary: string): Promise<void> {
  await mutate(uid, (a) => {
    const snap = { id: randomUUID(), at: new Date().toISOString(), healthScore: Math.round(healthScore), summary: summary.slice(0, 300) };
    return { ...a, weeklySnapshots: capPrepend(a.weeklySnapshots, snap, CAP.weeklySnapshots) };
  });
}

/* ── Stored timeline events ─────────────────────────────────────────────────*/

export async function recordMemoryEvent(
  uid: string,
  event: { type: MemoryEventType; title: string; detail?: string; score?: number | null },
): Promise<void> {
  const ev: MemoryEvent = {
    id: randomUUID(),
    type: event.type,
    title: event.title.slice(0, 160),
    detail: event.detail?.slice(0, 300),
    score: event.score ?? null,
    at: new Date().toISOString(),
    source: "stored",
  };
  await mutate(uid, (a) => ({ ...a, events: capPrepend(a.events, ev, CAP.events) }));
}

export async function deleteMemoryEvent(uid: string, id: string): Promise<void> {
  await mutate(uid, (a) => ({ ...a, events: a.events.filter((e) => e.id !== id) }));
}

/* ── Full wipe ──────────────────────────────────────────────────────────────*/

/** Clear all persisted AI memory for the user (derived data is untouched). */
export async function clearAllMemory(uid: string): Promise<void> {
  try {
    await ref(uid).delete();
  } catch (error) {
    console.error("[memory] clearAllMemory failed:", error instanceof Error ? error.message : error);
    throw error;
  }
}

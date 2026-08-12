// Standalone regression test for the dashboard profile-completeness crash fix.
// Exercises normalizeCareerProfile-equivalent logic + computeProfileCompleteness
// directly (no Firestore/network needed) against the 4 required scenarios.

import { computeProfileCompleteness } from "./src/features/dashboard/config";
import type { CareerProfile } from "./src/types/career-profile";

// Mirrors the private normalizeCareerProfile() in careerProfiles.ts
function normalizeCareerProfile(uid: string, data: Partial<CareerProfile>): CareerProfile {
  return {
    uid,
    education: data.education ?? [],
    experience: data.experience ?? [],
    currentRole: data.currentRole ?? null,
    skills: data.skills ?? [],
    interests: data.interests ?? [],
    goals: data.goals ?? [],
    targetRoles: data.targetRoles ?? [],
    strengths: data.strengths ?? [],
    aiSummary: data.aiSummary ?? null,
    createdAt: data.createdAt as CareerProfile["createdAt"],
    updatedAt: data.updatedAt as CareerProfile["updatedAt"],
  };
}

let failures = 0;
function check(label: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS  ${label}`);
  } catch (e) {
    failures++;
    console.log(`FAIL  ${label}: ${(e as Error).message}`);
  }
}

function assertEqual(a: unknown, b: unknown, msg: string) {
  if (a !== b) throw new Error(`${msg} (expected ${b}, got ${a})`);
}

// 1) Exact repro: legacy Firestore doc missing `experience` entirely (the
// reported crash — profile.experience.length threw TypeError).
check("legacy doc missing `experience` does not throw and treats it as empty", () => {
  const raw = {
    education: ["BS Computer Science"],
    currentRole: "Student",
    skills: [{ skillId: "js", level: 3 }],
    interests: ["ai"],
    goals: ["get a job"],
    targetRoles: ["SWE"],
    strengths: ["communication"],
    aiSummary: null,
    // experience: intentionally absent
  } as Partial<CareerProfile>;
  const normalized = normalizeCareerProfile("u1", raw);
  assertEqual(Array.isArray(normalized.experience), true, "experience should default to []");
  const score = computeProfileCompleteness(normalized); // must not throw
  // 7 of 9 checks true (education, currentRole, skills, interests, goals, targetRoles, strengths); experience+aiSummary false
  assertEqual(score, Math.round((7 / 9) * 100), "completeness score for legacy doc");
});

// 2) Fully populated profile.
check("fully populated profile scores 100", () => {
  const raw: CareerProfile = {
    uid: "u2",
    education: ["BS CS"],
    experience: ["Intern @ Acme"],
    currentRole: "Junior Dev",
    skills: [{ skillId: "js", level: 3 }],
    interests: ["ai"],
    goals: ["promo"],
    targetRoles: ["SWE II"],
    strengths: ["debugging"],
    aiSummary: "Strong technical profile.",
    createdAt: null as unknown as CareerProfile["createdAt"],
    updatedAt: null as unknown as CareerProfile["updatedAt"],
  };
  const normalized = normalizeCareerProfile("u2", raw);
  assertEqual(computeProfileCompleteness(normalized), 100, "full profile completeness");
});

// 3) Legacy/minimal profile missing only `experience` (doc predates that field).
check("minimal legacy profile missing only experience", () => {
  const raw = { education: [] } as Partial<CareerProfile>;
  const normalized = normalizeCareerProfile("u3", raw);
  assertEqual(normalized.experience.length, 0, "experience defaults to empty array");
  computeProfileCompleteness(normalized); // must not throw
});

// 4) Multiple missing array fields (very old/partial doc).
check("multiple missing array fields all default to empty, no throw", () => {
  const raw = { currentRole: "Student" } as Partial<CareerProfile>; // education, experience, skills, interests, goals, targetRoles, strengths ALL absent
  const normalized = normalizeCareerProfile("u4", raw);
  for (const key of ["education", "experience", "skills", "interests", "goals", "targetRoles", "strengths"] as const) {
    assertEqual(Array.isArray(normalized[key]), true, `${key} should default to []`);
    assertEqual(normalized[key].length, 0, `${key} should be empty`);
  }
  const score = computeProfileCompleteness(normalized);
  assertEqual(score, Math.round((1 / 9) * 100), "only currentRole true"); // 1 of 9 checks true
});

// 5) null profile (unauthenticated / no profile doc at all) — pre-existing guard.
check("null profile short-circuits to 0", () => {
  assertEqual(computeProfileCompleteness(null), 0, "null profile score");
});

console.log(failures === 0 ? "\nALL REGRESSION CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);

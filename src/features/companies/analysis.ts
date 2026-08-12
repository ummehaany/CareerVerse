import type { CompanyProfile, CompanyRole } from "@/lib/companies/types";
import type { ReadinessResult, UserSnapshot } from "./types";

/*
 * Deterministic "AI" readiness engine (the placeholder for a future model).
 * Pure and client-safe — compares a UserSnapshot against a company role and
 * produces a 0–100 readiness score with strong / improve / missing buckets,
 * a gap summary, estimated prep time, and a confidence level.
 */

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matches(target: string, pool: string[]): boolean {
  const t = norm(target);
  if (!t) return false;
  return pool.some((p) => {
    const n = norm(p);
    if (!n) return false;
    return n === t || n.includes(t) || t.includes(n);
  });
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Choose the most relevant role for a user (their target role, else the first). */
export function pickDefaultRole(profile: CompanyProfile, user: UserSnapshot): CompanyRole {
  const targets = user.targetRoles.map(norm);
  const byTarget = profile.roles.find((r) =>
    targets.some((t) => t && (norm(r.title).includes(t) || t.includes(norm(r.title)))),
  );
  return byTarget ?? profile.roles[0];
}

export function computeReadiness(
  user: UserSnapshot,
  profile: CompanyProfile,
  role: CompanyRole,
): ReadinessResult {
  const strongPool = user.strongSkills.concat(user.resumeSkills);
  const allPool = user.skills.concat(user.resumeSkills, user.learningSkills);

  const strong: string[] = [];
  const improve: string[] = [];
  const missing: string[] = [];

  let reqStrong = 0;
  let reqImprove = 0;
  for (const req of role.requiredSkills) {
    if (matches(req, strongPool)) {
      strong.push(req);
      reqStrong += 1;
    } else if (matches(req, allPool)) {
      improve.push(req);
      reqImprove += 1;
    } else {
      missing.push(req);
    }
  }

  let prefStrong = 0;
  for (const pref of role.preferredSkills) {
    if (matches(pref, strongPool)) {
      prefStrong += 1;
      if (!strong.includes(pref)) strong.push(pref);
    } else if (matches(pref, allPool)) {
      if (!improve.includes(pref)) improve.push(pref);
    }
  }

  const reqTotal = Math.max(1, role.requiredSkills.length);
  const coverage = (reqStrong + 0.5 * reqImprove) / reqTotal;
  const prefBonus = 0.15 * (prefStrong / Math.max(1, role.preferredSkills.length));
  const skillScore = clamp((coverage * 0.85 + prefBonus) * 100, 0, 100);

  // Blend with overall CareerVerse signals (kept a minority weight).
  const signals = [
    user.interviewBest,
    user.skillReadiness,
    user.resumeCompletion || null,
    user.roadmapCompletion || null,
  ].filter((n): n is number => typeof n === "number" && n > 0);
  const signalAvg = signals.length ? signals.reduce((a, b) => a + b, 0) / signals.length : skillScore;

  const difficultyMult = 1 - (profile.record.difficulty - 1) * 0.04; // 1.0 … 0.84
  const raw = (skillScore * 0.8 + signalAvg * 0.2) * difficultyMult;
  const score = Math.round(clamp(raw, 5, 98));

  // Confidence from how much profile data we have.
  const dataPoints = [
    user.skills.length >= 5,
    user.hasResume,
    user.targetRoles.length > 0,
    user.skillReadiness !== null,
    user.interviewBest !== null,
  ].filter(Boolean).length;
  const confidence = dataPoints >= 4 ? "High" : dataPoints >= 2 ? "Medium" : "Low";

  // Estimated preparation time.
  let weeks = missing.length * 3 + reqImprove * 1.5 + (profile.record.difficulty - 3);
  weeks = Math.max(0, Math.round(weeks));
  let prepTime: string;
  if (missing.length === 0 && reqImprove === 0) {
    prepTime = "You're on the bar — polish and apply";
  } else if (weeks <= 1) {
    prepTime = "~1 week";
  } else if (weeks <= 10) {
    prepTime = `~${weeks} weeks`;
  } else {
    prepTime = `~${Math.round(weeks / 4)} months`;
  }

  const focusSkills = missing.slice(0, 3);
  const gapSummary =
    missing.length === 0 && improve.length === 0
      ? `You match all core skills for ${role.title} at ${profile.record.name}. Focus on interview practice and portfolio polish.`
      : `You cover ${reqStrong} of ${role.requiredSkills.length} core skills for ${role.title} at ${profile.record.name}.` +
        (focusSkills.length ? ` Prioritize ${focusSkills.join(", ")}.` : ` Strengthen the skills flagged below.`);

  return {
    score,
    confidence,
    strong,
    improve,
    missing,
    gapSummary,
    prepTime,
    roleTitle: role.title,
  };
}

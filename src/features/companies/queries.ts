import { verifySession } from "@/lib/firebase/auth";
import {
  COMPANY_CATEGORIES,
  getCompanyRecord,
  getCompanyRecords,
  toCardData,
} from "@/lib/companies/catalog";
import { rolesForTier } from "@/lib/companies/roles";
import { buildCompanyProfile } from "@/lib/companies/profile";
import type { CompanyRecord } from "@/lib/companies/types";
import { getDreamState } from "@/lib/firebase/firestore/dreamCompanies";
import { buildUserSnapshot, emptySnapshot } from "./snapshot";
import { computeReadiness, pickDefaultRole } from "./analysis";
import type {
  CompaniesHomeData,
  CompanyDashboardData,
  CompanyDetailData,
  DreamSpotlight,
  SavedCompanyView,
  UserSnapshot,
} from "./types";

function buildDreamSpotlight(record: CompanyRecord, user: UserSnapshot): DreamSpotlight {
  const profile = buildCompanyProfile(record);
  const role = pickDefaultRole(profile, user);
  const readiness = computeReadiness(user, profile, role);
  const remainingSkills = [...readiness.missing, ...readiness.improve];

  const nextTask =
    readiness.missing.length > 0
      ? `Master ${readiness.missing[0]}`
      : readiness.improve.length > 0
        ? `Strengthen ${readiness.improve[0]}`
        : "Run a mock interview and polish your resume";

  const signals = [readiness.score, user.resumeCompletion, user.roadmapCompletion, user.interviewBest].filter(
    (n): n is number => typeof n === "number" && n > 0,
  );
  const preparation = signals.length
    ? Math.round(signals.reduce((a, b) => a + b, 0) / signals.length)
    : readiness.score;

  return {
    name: record.name,
    slug: record.slug,
    brand: record.brand,
    roleTitle: readiness.roleTitle,
    score: readiness.score,
    confidence: readiness.confidence,
    prepTime: readiness.prepTime,
    preparation,
    nextTask,
    remainingSkills,
  };
}

function roleCountFor(record: CompanyRecord): number {
  return new Set([...rolesForTier(record.tier), ...(record.extraRoleKeys ?? [])]).size;
}

function readinessScoreFor(record: CompanyRecord, user: UserSnapshot): number {
  const profile = buildCompanyProfile(record);
  const role = pickDefaultRole(profile, user);
  return computeReadiness(user, profile, role).score;
}

function emptyDashboard(): CompanyDashboardData {
  return {
    saved: [],
    dream: [],
    recent: [],
    savedCount: 0,
    dreamCount: 0,
    roadmapCompletion: 0,
    interviewReadiness: null,
    resumeReadiness: 0,
    topPick: null,
    dreamSpotlight: null,
  };
}

export async function getCompaniesHomeData(): Promise<CompaniesHomeData> {
  const records = getCompanyRecords();
  const companies = records.map((r) => toCardData(r, roleCountFor(r)));
  const categories = COMPANY_CATEGORIES;

  const decoded = await verifySession();
  if (!decoded) {
    return { companies, categories, dashboard: emptyDashboard() };
  }
  const uid = decoded.uid;
  const [state, user] = await Promise.all([getDreamState(uid), buildUserSnapshot(uid)]);

  const toView = (r: CompanyRecord): SavedCompanyView => ({
    ...toCardData(r, roleCountFor(r)),
    readiness: readinessScoreFor(r, user),
  });

  const saved = state.saved
    .map(getCompanyRecord)
    .filter((r): r is CompanyRecord => Boolean(r))
    .map(toView);
  const dream = state.dream
    .map(getCompanyRecord)
    .filter((r): r is CompanyRecord => Boolean(r))
    .map(toView);
  const recent = state.recent
    .map(getCompanyRecord)
    .filter((r): r is CompanyRecord => Boolean(r))
    .map((r) => toCardData(r, roleCountFor(r)));

  const pool = [...saved, ...dream];
  const top = pool.length
    ? pool.reduce((best, cur) => (cur.readiness > best.readiness ? cur : best))
    : null;

  const dreamRecord = state.dream.map(getCompanyRecord).find((r): r is CompanyRecord => Boolean(r));
  const dreamSpotlight = dreamRecord ? buildDreamSpotlight(dreamRecord, user) : null;

  const dashboard: CompanyDashboardData = {
    saved,
    dream,
    recent,
    savedCount: saved.length,
    dreamCount: dream.length,
    roadmapCompletion: user.roadmapCompletion,
    interviewReadiness: user.interviewBest,
    resumeReadiness: user.resumeCompletion,
    topPick: top ? { name: top.name, slug: top.slug, score: top.readiness } : null,
    dreamSpotlight,
  };

  return { companies, categories, dashboard };
}

export async function getCompanyDetailData(slug: string): Promise<CompanyDetailData | null> {
  const record = getCompanyRecord(slug);
  if (!record) return null;
  const profile = buildCompanyProfile(record);

  const decoded = await verifySession();
  if (!decoded) {
    const user = emptySnapshot();
    return {
      profile,
      user,
      defaultRoleKey: pickDefaultRole(profile, user).key,
      isSaved: false,
      isDream: false,
    };
  }
  const uid = decoded.uid;
  const [state, user] = await Promise.all([getDreamState(uid), buildUserSnapshot(uid)]);

  return {
    profile,
    user,
    defaultRoleKey: pickDefaultRole(profile, user).key,
    isSaved: state.saved.includes(slug),
    isDream: state.dream.includes(slug),
  };
}

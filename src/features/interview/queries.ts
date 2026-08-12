import { verifySession } from "@/lib/firebase/auth";
import { getLatestRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import {
  listRecentInterviews,
  getInterviewAnalytics,
  type InterviewAnalytics,
} from "@/lib/firebase/firestore/interviews";
import { isAIConfigured } from "@/lib/ai";
import type { InterviewDifficulty, InterviewType } from "@/types/interview";

export interface RecentInterview {
  id: string;
  role: string;
  type: InterviewType | null;
  difficulty: InterviewDifficulty;
  overallScore: number | null;
  questionCount: number;
  createdAtMs: number | null;
}

export interface InterviewPageData {
  careerOptions: string[];
  recent: RecentInterview[];
  analytics: InterviewAnalytics;
  aiConfigured: boolean;
}

const EMPTY_ANALYTICS: InterviewAnalytics = {
  count: 0,
  averageScore: null,
  bestScore: null,
  trend: [],
  strongest: [],
  weakest: [],
};

export async function getInterviewPageData(): Promise<InterviewPageData> {
  const decoded = await verifySession();
  if (!decoded) {
    return { careerOptions: [], recent: [], analytics: EMPTY_ANALYTICS, aiConfigured: false };
  }
  const uid = decoded.uid;

  const [recommendationSet, recentDocs, analytics] = await Promise.all([
    getLatestRecommendationSet(uid),
    listRecentInterviews(uid, 8),
    getInterviewAnalytics(uid),
  ]);

  const careerOptions = (recommendationSet?.recommendations ?? []).map((r) => r.title);

  const recent: RecentInterview[] = recentDocs.map((doc) => ({
    id: doc.id,
    role: doc.role,
    type: doc.type ?? null,
    difficulty: doc.difficulty,
    overallScore: doc.evaluation?.overallScore ?? null,
    questionCount: doc.questions?.length ?? 0,
    createdAtMs: doc.createdAt ? doc.createdAt.toDate().getTime() : null,
  }));

  return { careerOptions, recent, analytics, aiConfigured: isAIConfigured() };
}

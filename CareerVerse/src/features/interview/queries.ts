import { verifySession } from "@/lib/firebase/auth";
import { getLatestRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import { listRecentInterviews } from "@/lib/firebase/firestore/interviews";
import { isAIConfigured } from "@/lib/ai";
import type { InterviewDifficulty } from "@/types/interview";

export interface RecentInterview {
  id: string;
  role: string;
  difficulty: InterviewDifficulty;
  overallScore: number | null;
  questionCount: number;
}

export interface InterviewPageData {
  careerOptions: string[];
  recent: RecentInterview[];
  aiConfigured: boolean;
}

export async function getInterviewPageData(): Promise<InterviewPageData> {
  const decoded = await verifySession();
  if (!decoded) return { careerOptions: [], recent: [], aiConfigured: false };
  const uid = decoded.uid;

  const [recommendationSet, recentDocs] = await Promise.all([
    getLatestRecommendationSet(uid),
    listRecentInterviews(uid, 5),
  ]);

  const careerOptions = (recommendationSet?.recommendations ?? []).map((r) => r.title);

  const recent: RecentInterview[] = recentDocs.map((doc) => ({
    id: doc.id,
    role: doc.role,
    difficulty: doc.difficulty,
    overallScore: doc.evaluation?.overallScore ?? null,
    questionCount: doc.questions?.length ?? 0,
  }));

  return { careerOptions, recent, aiConfigured: isAIConfigured() };
}

import { verifySession } from "@/lib/firebase/auth";
import { isAIConfigured } from "@/lib/ai";
import { listConversations } from "@/lib/firebase/firestore/coachConversations";
import { buildCoachContext } from "./context";
import {
  SUGGESTED_PROMPTS,
  buildDailyAdvice,
  buildInsights,
  buildRecommendations,
} from "./engine";
import type {
  CoachContext,
  CoachHomeData,
  CoachWidgetData,
  Conversation,
} from "./types";

function emptyContext(): CoachContext {
  return {
    firstName: "there",
    hasData: false,
    careerMatch: null,
    dreamCompany: null,
    hasResume: false,
    resumeCompletion: 0,
    roadmap: null,
    nextMilestone: null,
    skillReadiness: null,
    careerReadiness: 0,
    strongestSkill: null,
    biggestGap: null,
    strongSkills: [],
    missingSkills: [],
    interviewBest: null,
    targetRoles: [],
    onboarding: null,
  };
}

export async function getCoachHomeData(): Promise<CoachHomeData> {
  const decoded = await verifySession();

  if (!decoded) {
    const context = emptyContext();
    const { advice, priority } = buildDailyAdvice(context);
    return {
      context,
      conversations: [],
      suggestedPrompts: SUGGESTED_PROMPTS,
      insights: buildInsights(context),
      recommendations: buildRecommendations(context),
      dailyAdvice: advice,
      todaysPriority: priority,
      aiConfigured: false,
    };
  }

  const [context, convDocs] = await Promise.all([
    buildCoachContext(decoded.uid),
    listConversations(decoded.uid, 40),
  ]);

  const conversations: Conversation[] = convDocs.map((d) => ({
    id: d.id,
    title: d.title,
    pinned: d.pinned,
    messages: d.messages,
    updatedAtMs: d.updatedAt ? d.updatedAt.toDate().getTime() : null,
  }));

  const { advice, priority } = buildDailyAdvice(context);

  return {
    context,
    conversations,
    suggestedPrompts: SUGGESTED_PROMPTS,
    insights: buildInsights(context),
    recommendations: buildRecommendations(context),
    dailyAdvice: advice,
    todaysPriority: priority,
    aiConfigured: isAIConfigured(),
  };
}

export async function getCoachWidgetData(): Promise<CoachWidgetData> {
  const decoded = await verifySession();
  if (!decoded) {
    const context = emptyContext();
    const { advice, priority } = buildDailyAdvice(context);
    return { dailyAdvice: advice, todaysPriority: priority, careerReadiness: 0, progress: [] };
  }

  const context = await buildCoachContext(decoded.uid);
  const { advice, priority } = buildDailyAdvice(context);
  return {
    dailyAdvice: advice,
    todaysPriority: priority,
    careerReadiness: context.careerReadiness,
    progress: [
      { label: "Resume", value: context.resumeCompletion },
      { label: "Roadmap", value: context.roadmap?.percent ?? 0 },
      { label: "Skill readiness", value: context.skillReadiness ?? 0 },
    ],
  };
}

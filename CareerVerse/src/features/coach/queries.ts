import { verifySession } from "@/lib/firebase/auth";
import { listCoachMessages } from "@/lib/firebase/firestore/coach";
import { isAIConfigured } from "@/lib/ai";
import type { CoachMessageView } from "@/types/coach";

export interface CoachPageData {
  messages: CoachMessageView[];
  aiConfigured: boolean;
}

export async function getCoachData(): Promise<CoachPageData> {
  const decoded = await verifySession();
  if (!decoded) return { messages: [], aiConfigured: false };

  const messages = await listCoachMessages(decoded.uid, 40);
  return {
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    aiConfigured: isAIConfigured(),
  };
}

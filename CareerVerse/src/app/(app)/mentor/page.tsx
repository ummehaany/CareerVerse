import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";
import { SparklesIcon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "AI Mentor" };

export default function MentorPage() {
  return (
    <ComingSoon
      title="AI Mentor"
      description="A persistent mentor that knows your profile and progress, available whenever you need guidance."
      icon={SparklesIcon}
      bullets={[
        "Chat grounded in your real profile and activity",
        "Persistent conversation threads you can return to",
        "Realtime, streamed responses",
      ]}
    />
  );
}

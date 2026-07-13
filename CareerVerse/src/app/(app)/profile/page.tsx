import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";
import { UserIcon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <ComingSoon
      title="Career Profile"
      description="View and edit the profile that powers your matches, roadmaps, and mentorship."
      icon={UserIcon}
      bullets={[
        "Education, experience, skills, interests, and goals",
        "AI-derived strengths and target roles",
        "Editable at any time to refine your recommendations",
      ]}
    />
  );
}

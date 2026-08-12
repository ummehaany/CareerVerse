import type { Metadata } from "next";
import { getSkillGapPageData } from "@/features/skillgap/queries";
import { SkillGapView } from "@/features/skillgap/components/skillgap-view";

export const metadata: Metadata = {
  title: "Skill Gap Analysis",
  description:
    "Compare your current skills against your target career, get an AI readiness score, learning recommendations, and a personalized action plan.",
};

export default async function SkillGapPage() {
  const data = await getSkillGapPageData();
  return <SkillGapView data={data} />;
}

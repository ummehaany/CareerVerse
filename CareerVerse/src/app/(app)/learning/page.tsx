import type { Metadata } from "next";
import { getLearningPageData } from "@/features/learning/queries";
import { LearningHub } from "@/features/learning/components/learning-hub";

export const metadata: Metadata = { title: "Learning Hub" };

export default async function LearningPage() {
  const data = await getLearningPageData();
  return <LearningHub data={data} />;
}

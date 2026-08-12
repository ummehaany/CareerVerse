import type { Metadata } from "next";
import { getCoachHomeData } from "@/features/career-coach/queries";
import { CoachView } from "@/features/career-coach/components/coach-view";

export const metadata: Metadata = { title: "AI Career Coach" };

export default async function CoachPage() {
  const data = await getCoachHomeData();
  return <CoachView data={data} />;
}

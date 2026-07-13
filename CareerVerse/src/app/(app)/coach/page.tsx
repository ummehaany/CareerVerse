import type { Metadata } from "next";
import { getCoachData } from "@/features/coach/queries";
import { CoachChat } from "@/features/coach/components/coach-chat";

export const metadata: Metadata = { title: "AI Career Coach" };

export default async function CoachPage() {
  const data = await getCoachData();
  return <CoachChat data={data} />;
}

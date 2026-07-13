import type { Metadata } from "next";
import { getAchievementsData } from "@/features/achievements/queries";
import { AchievementsView } from "@/features/achievements/components/achievements-view";

export const metadata: Metadata = { title: "Achievements" };

export default async function AchievementsPage() {
  const data = await getAchievementsData();
  return <AchievementsView data={data} />;
}

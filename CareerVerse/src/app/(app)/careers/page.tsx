import type { Metadata } from "next";
import { getCareersListData } from "@/features/careers/queries";
import { CareerExplorer } from "@/features/careers/components/career-explorer";

export const metadata: Metadata = { title: "Explore Careers" };

export default async function CareersPage() {
  const data = await getCareersListData();
  return <CareerExplorer data={data} />;
}

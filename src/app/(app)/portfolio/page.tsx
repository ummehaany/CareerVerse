import type { Metadata } from "next";
import { getPortfolioPageData } from "@/features/portfolio/queries";
import { PortfolioView } from "@/features/portfolio/components/portfolio-view";

export const metadata: Metadata = {
  title: "Smart Profile & Portfolio",
  description:
    "Build your professional career identity — profile, skills, projects, certifications, achievements, and a clean shareable portfolio.",
};

export default async function PortfolioPage() {
  const data = await getPortfolioPageData();
  return <PortfolioView data={data} />;
}

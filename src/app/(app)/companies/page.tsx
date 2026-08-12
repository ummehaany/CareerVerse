import type { Metadata } from "next";
import { getCompaniesHomeData } from "@/features/companies/queries";
import { CompaniesHome } from "@/features/companies/components/companies-home";
import { getIntelligence } from "@/features/intelligence/queries";
import { actionForContext } from "@/features/intelligence/engine";
import { InsightTip } from "@/features/intelligence/components/insight-tip";

export const metadata: Metadata = {
  title: "Target Companies",
  description:
    "Explore top companies, understand exactly what it takes to get in, and measure your readiness against their bar.",
};

export default async function CompaniesPage() {
  const data = await getCompaniesHomeData();
  const intel = await getIntelligence();
  const tip = actionForContext(intel, "companies");
  return (
    <div className="space-y-6">
      {tip && (
        <div className="mx-auto max-w-6xl">
          <InsightTip action={tip} />
        </div>
      )}
      <CompaniesHome data={data} />
    </div>
  );
}

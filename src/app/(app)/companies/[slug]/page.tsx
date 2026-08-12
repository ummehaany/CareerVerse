import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompanyDetailData } from "@/features/companies/queries";
import { CompanyDetail } from "@/features/companies/components/company-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCompanyDetailData(slug);
  return {
    title: data ? `${data.profile.record.name} — Target Companies` : "Company",
  };
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCompanyDetailData(slug);
  if (!data) notFound();
  return <CompanyDetail data={data} />;
}

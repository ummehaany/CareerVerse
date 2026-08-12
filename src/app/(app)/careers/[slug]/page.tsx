import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCareerDetailData } from "@/features/careers/queries";
import { CareerDetail } from "@/features/careers/components/career-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCareerDetailData(slug);
  return { title: data.career ? data.career.title : "Career" };
}

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCareerDetailData(slug);
  if (!data.career) notFound();
  return <CareerDetail data={data} />;
}

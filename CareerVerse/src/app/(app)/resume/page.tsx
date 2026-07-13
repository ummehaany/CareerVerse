import type { Metadata } from "next";
import { getResumePageData } from "@/features/resume/queries";
import { ResumeBuilder } from "@/features/resume/components/resume-builder";

export const metadata: Metadata = { title: "Resume Builder" };

export default async function ResumePage() {
  const data = await getResumePageData();
  return <ResumeBuilder data={data} />;
}

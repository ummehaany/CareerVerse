import type { Metadata } from "next";
import { getInterviewPageData } from "@/features/interview/queries";
import { InterviewView } from "@/features/interview/components/interview-view";

export const metadata: Metadata = { title: "Mock Interviews" };

export default async function InterviewsPage() {
  const data = await getInterviewPageData();
  return <InterviewView data={data} />;
}

import type { Metadata } from "next";
import { AboutView } from "@/features/about/components/about-view";

export const metadata: Metadata = {
  title: "About",
  description:
    "CareerVerse is an AI-powered career companion that helps students and professionals discover careers, find matches, build learning roadmaps, and grow.",
};

export default function AboutPage() {
  return <AboutView />;
}

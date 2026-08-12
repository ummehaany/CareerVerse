"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { savePortfolio } from "@/lib/firebase/firestore/portfolio";
import type { Portfolio } from "@/types/portfolio";
import { ROUTES } from "@/config/routes";

const str = (max = 300) => z.string().max(max);
const level = z.enum(["beginner", "intermediate", "advanced", "expert"]);

const skill = z.object({ name: str(80).min(1), level });

const education = z.object({
  id: str(60),
  school: str(120),
  degree: str(120),
  field: str(120),
  startYear: str(20),
  endYear: str(20),
});

const project = z.object({
  id: str(60),
  name: str(120),
  description: str(1200),
  technologies: z.array(str(60)).max(40),
  githubUrl: str(400),
  demoUrl: str(400),
});

const certification = z.object({
  id: str(60),
  name: str(160),
  issuer: str(160),
  issueDate: str(40),
  credentialUrl: str(400),
});

const achievement = z.object({
  id: str(60),
  title: str(160),
  type: z.enum(["award", "competition", "internship", "leadership", "other"]),
  organization: str(160),
  date: str(40),
  description: str(1200),
});

const portfolioSchema = z.object({
  personal: z.object({
    fullName: str(120),
    headline: str(160),
    photoUrl: str(600),
    bio: str(2000),
    careerGoal: str(400),
    location: str(120),
    email: str(160),
    phone: str(60),
  }),
  education: z.array(education).max(20),
  technicalSkills: z.array(skill).max(80),
  softSkills: z.array(skill).max(80),
  projects: z.array(project).max(40),
  certifications: z.array(certification).max(40),
  achievements: z.array(achievement).max(40),
  careerGoals: z.object({
    dreamJob: str(160),
    targetCompany: str(160),
    targetSalary: str(80),
    workMode: z.enum(["remote", "hybrid", "onsite", ""]),
  }),
  social: z.object({
    linkedin: str(400),
    github: str(400),
    website: str(400),
    twitter: str(400),
  }),
});

export type SavePortfolioResult = { ok: true } | { ok: false; error: string };

/** Validate and persist the user's portfolio. */
export async function savePortfolioAction(input: unknown): Promise<SavePortfolioResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };

    const parsed = portfolioSchema.parse(input) as Portfolio;
    await savePortfolio(decoded.uid, parsed);

    revalidatePath(ROUTES.portfolio);
    revalidatePath(ROUTES.dashboard);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't save your portfolio. Please try again." };
  }
}

import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/icon";
import { UsersIcon, CodeIcon, ChatIcon, BeakerIcon, MegaphoneIcon } from "@/components/ui/icon";
import type { InterviewType } from "@/types/interview";

export interface InterviewTypeMeta {
  value: InterviewType;
  label: string;
  short: string;
  description: string;
  icon: ComponentType<IconProps>;
  accentVar: string;
}

export const INTERVIEW_TYPES: InterviewTypeMeta[] = [
  {
    value: "hr",
    label: "HR Interview",
    short: "HR",
    description: "Motivation, background, strengths, and culture-fit questions.",
    icon: UsersIcon,
    accentVar: "--accent-mentor",
  },
  {
    value: "technical",
    label: "Technical Interview",
    short: "Technical",
    description: "Role-specific technical depth and problem questions.",
    icon: CodeIcon,
    accentVar: "--accent-assessment",
  },
  {
    value: "behavioral",
    label: "Behavioral Interview",
    short: "Behavioral",
    description: "STAR-style situational, teamwork, and conflict questions.",
    icon: ChatIcon,
    accentVar: "--accent-roadmap",
  },
  {
    value: "case-study",
    label: "Case Study Interview",
    short: "Case Study",
    description: "Structured problem-solving, estimation, and analysis.",
    icon: BeakerIcon,
    accentVar: "--accent-resume",
  },
  {
    value: "group-discussion",
    label: "Group Discussion",
    short: "Group Discussion",
    description: "Opinion prompts to practice articulation and reasoning.",
    icon: MegaphoneIcon,
    accentVar: "--accent-interview",
  },
];

export function interviewTypeMeta(type: InterviewType | undefined): InterviewTypeMeta {
  return INTERVIEW_TYPES.find((t) => t.value === type) ?? INTERVIEW_TYPES[1];
}

export const DIFFICULTY_LABEL: Record<string, string> = {
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
};

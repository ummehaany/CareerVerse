import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/icon";
import {
  HomeIcon,
  CompassIcon,
  GlobeIcon,
  TargetIcon,
  RouteIcon,
  ClockIcon,
  BookIcon,
  FileTextIcon,
  MicIcon,
  SparklesIcon,
  UserIcon,
  SettingsIcon,
  HeartIcon,
  PuzzleIcon,
  BriefcaseIcon,
  RocketIcon,
  ChartIcon,
} from "@/components/ui/icon";
import { AwardIcon } from "@/components/ui/icons-extended";
import type { UserRole } from "@/types/user";
import { ROUTES } from "./routes";

/*
 * Data-driven navigation (architecture §6). Links, icons, grouping and role
 * gating are declared once here and consumed by every nav surface.
 */
export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
  /** When set, the item renders only for users holding one of these roles. */
  roles?: UserRole[];
}

export interface NavGroup {
  key: string;
  label?: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    key: "main",
    items: [
      { key: "dashboard", label: "Dashboard", href: ROUTES.dashboard, icon: HomeIcon },
      { key: "assessment", label: "Career Discovery", href: ROUTES.assessment, icon: CompassIcon },
      { key: "careers", label: "Explore Careers", href: ROUTES.careers, icon: GlobeIcon },
      { key: "recommendations", label: "Career Matches", href: ROUTES.recommendations, icon: TargetIcon },
      { key: "companies", label: "Target Companies", href: ROUTES.companies, icon: RocketIcon },
      { key: "roadmap", label: "Learning Roadmap", href: ROUTES.roadmap, icon: RouteIcon },
      { key: "learning", label: "Learning Hub", href: ROUTES.learning, icon: BookIcon },
      { key: "resume", label: "Resume Builder", href: ROUTES.resume, icon: FileTextIcon },
      { key: "interviews", label: "Mock Interviews", href: ROUTES.interviews, icon: MicIcon },
      { key: "coach", label: "AI Coach", href: ROUTES.coach, icon: SparklesIcon },
    ],
  },
  {
    key: "growth",
    label: "Growth",
    items: [
      { key: "timeline", label: "Career Timeline", href: ROUTES.timeline, icon: ClockIcon },
      { key: "achievements", label: "Achievements", href: ROUTES.achievements, icon: AwardIcon },
      { key: "skillgap", label: "Skill Gap", href: ROUTES.skillGap, icon: PuzzleIcon },
      { key: "analytics", label: "Analytics", href: ROUTES.analytics, icon: ChartIcon },
    ],
  },
  {
    key: "account",
    label: "Account",
    items: [
      { key: "profile", label: "Profile", href: ROUTES.profile, icon: UserIcon },
      { key: "portfolio", label: "Portfolio", href: ROUTES.portfolio, icon: BriefcaseIcon },
      { key: "settings", label: "Settings", href: ROUTES.settings, icon: SettingsIcon },
      { key: "about", label: "About", href: ROUTES.about, icon: HeartIcon },
    ],
  },
];

/** Drop items the given role may not see. Groups left empty are removed. */
export function navForRole(role: UserRole | undefined): NavGroup[] {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || (role && item.roles.includes(role))),
    }))
    .filter((group) => group.items.length > 0);
}

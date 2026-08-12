import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/icon";
import {
  CompassIcon,
  TargetIcon,
  RouteIcon,
  FileTextIcon,
  MicIcon,
  PuzzleIcon,
  RocketIcon,
  SparklesIcon,
  ChartIcon,
  ClockIcon,
} from "@/components/ui/icon";

/** Icon-key → component map shared by the intelligence components. */
export const INTEL_ICONS: Record<string, ComponentType<IconProps>> = {
  compass: CompassIcon,
  target: TargetIcon,
  route: RouteIcon,
  file: FileTextIcon,
  mic: MicIcon,
  puzzle: PuzzleIcon,
  rocket: RocketIcon,
  sparkles: SparklesIcon,
  chart: ChartIcon,
  clock: ClockIcon,
};

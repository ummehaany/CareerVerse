import type { ComponentType } from "react";
import {
  type IconProps,
  CompassIcon,
  BookIcon,
  CodeIcon,
  ChatIcon,
  SparklesIcon,
  PuzzleIcon,
  BriefcaseIcon,
  HeartIcon,
  FlagIcon,
  RocketIcon,
  PaletteIcon,
  BeakerIcon,
  WrenchIcon,
  ChartIcon,
  GlobeIcon,
  ShieldIcon,
  MegaphoneIcon,
  LightbulbIcon,
  UsersIcon,
  FileTextIcon,
  LayersIcon,
  SearchIcon,
  ClockIcon,
  TargetIcon,
  DollarIcon,
  ScaleIcon,
  PlayIcon,
} from "@/components/ui/icon";

/** Maps the string icon keys used in the question bank to icon components. */
const REGISTRY: Record<string, ComponentType<IconProps>> = {
  compass: CompassIcon,
  book: BookIcon,
  code: CodeIcon,
  chat: ChatIcon,
  sparkles: SparklesIcon,
  puzzle: PuzzleIcon,
  briefcase: BriefcaseIcon,
  heart: HeartIcon,
  flag: FlagIcon,
  rocket: RocketIcon,
  palette: PaletteIcon,
  beaker: BeakerIcon,
  wrench: WrenchIcon,
  chart: ChartIcon,
  globe: GlobeIcon,
  shield: ShieldIcon,
  megaphone: MegaphoneIcon,
  lightbulb: LightbulbIcon,
  users: UsersIcon,
  file: FileTextIcon,
  layers: LayersIcon,
  search: SearchIcon,
  clock: ClockIcon,
  target: TargetIcon,
  dollar: DollarIcon,
  scale: ScaleIcon,
  play: PlayIcon,
};

export function OptionIcon({
  name,
  size = 20,
  className,
}: {
  name?: string;
  size?: number;
  className?: string;
}) {
  const Icon = name ? REGISTRY[name] : undefined;
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}

export function hasIcon(name?: string): boolean {
  return Boolean(name && REGISTRY[name]);
}

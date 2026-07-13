import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * Dependency-free icon set (stroke-based, 24×24, currentColor).
 * We avoid pulling in an icon package to keep the project dependency surface
 * small and consistent with the hand-rolled `cn` helper. All icons share the
 * same props and inherit color from `currentColor`.
 */
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

function Base({ size = 20, className, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </Base>
);

export const CompassIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
  </Base>
);

export const RouteIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="6" cy="19" r="2.5" />
    <circle cx="18" cy="5" r="2.5" />
    <path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" />
  </Base>
);

export const FileTextIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h6M9 9h1" />
  </Base>
);

export const MicIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3M8 21h8" />
  </Base>
);

export const SparklesIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="M12 8.5 13.4 11 16 12l-2.6 1L12 15.5 10.6 13 8 12l2.6-1L12 8.5Z" />
  </Base>
);

export const UserIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Base>
);

export const SettingsIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H2a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V2a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H22a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.4.9Z" />
  </Base>
);

export const MenuIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Base>
);

export const XIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const BellIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Base>
);

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 6 6 6-6 6" />
  </Base>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m15 6-6 6 6 6" />
  </Base>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const LogOutIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 17l5-5-5-5M15 12H3" />
  </Base>
);

export const TargetIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </Base>
);

export const TrendingUpIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M17 7h4v4" />
  </Base>
);

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12 5 5 9-11" />
  </Base>
);

export const CheckCircleIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </Base>
);

export const LayersIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </Base>
);

// ── Assessment option / section icons ──────────────────────────────────────

export const BookIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5Z" />
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
  </Base>
);

export const CodeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12" />
  </Base>
);

export const BriefcaseIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
  </Base>
);

export const HeartIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20s-7-4.4-9.2-8.3A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 9.2 5.7C19 15.6 12 20 12 20Z" />
  </Base>
);

export const PuzzleIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 4a2 2 0 0 1 4 0c0 .7-.3 1.3-.3 1.8 0 .6.4 1.2 1.3 1.2H17a1 1 0 0 1 1 1v2.7c0 .9.6 1.3 1.2 1.3.5 0 1.1-.3 1.8-.3a2 2 0 0 1 0 4c-.7 0-1.3-.3-1.8-.3-.6 0-1.2.4-1.2 1.3V20a1 1 0 0 1-1 1h-2.7c-.9 0-1.3-.6-1.3-1.2 0-.5.3-1.1.3-1.8a2 2 0 0 0-4 0c0 .7.3 1.3.3 1.8 0 .6-.4 1.2-1.3 1.2H5a1 1 0 0 1-1-1v-2.5" />
    <path d="M4 13.5c.6 0 1.2.3 1.8.3.9 0 1.2-.6 1.2-1.3V8a1 1 0 0 1 1-1h1.5" />
  </Base>
);

export const RocketIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2 0-2.8a2 2 0 0 0-3 0Z" />
    <path d="M9 15l-3-3c1-5 5-9 11-9 0 6-4 10-9 11Z" />
    <circle cx="14.5" cy="8.5" r="1.5" />
  </Base>
);

export const UsersIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7M17.5 20a6 6 0 0 0-3-5.2" />
  </Base>
);

export const PaletteIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3a9 9 0 0 0 0 18c1.7 0 2-1.3 1.2-2.2-.8-1 .1-2.3 1.3-2.3H17a4 4 0 0 0 4-4c0-4.9-4-9-9-9Z" />
    <circle cx="7.5" cy="11" r="1" />
    <circle cx="10.5" cy="7.5" r="1" />
    <circle cx="15" cy="8" r="1" />
  </Base>
);

export const BeakerIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" />
    <path d="M7 15h10" />
  </Base>
);

export const WrenchIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M15 6a4 4 0 0 0 5 5l-2 2a4 4 0 0 1-5-5Z" />
    <path d="m13 8-8 8a2 2 0 0 0 3 3l8-8" />
  </Base>
);

export const ChartIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 4v16h16" />
    <path d="M8 16v-4M12 16v-7M16 16v-2" />
  </Base>
);

export const GlobeIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
  </Base>
);

export const ShieldIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 5 6v5c0 4.5 3 7.5 7 10 4-2.5 7-5.5 7-10V6Z" />
  </Base>
);

export const MegaphoneIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 10v4a1 1 0 0 0 1 1h2l7 4V5L7 9H5a1 1 0 0 0-1 1Z" />
    <path d="M18 8a4 4 0 0 1 0 8" />
  </Base>
);

export const LightbulbIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.3 1 2.5h6c0-1.2.4-1.9 1-2.5A6 6 0 0 0 12 3Z" />
  </Base>
);

export const ChatIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
    <path d="M8 10h8M8 13h5" />
  </Base>
);

export const FlagIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 21V4M5 4h11l-1.5 3.5L16 11H5" />
  </Base>
);

export const DollarIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v18" />
    <path d="M16 7.5C16 5.6 14.2 4.5 12 4.5S8 5.6 8 7.5 9.8 10.5 12 10.5s4 1.1 4 3-1.8 3-4 3-4-1.1-4-3" />
  </Base>
);

export const ScaleIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v18M7 21h10M5 7h14M8 3l-4 8a3 3 0 0 0 6 0Zm12 0-4 8a3 3 0 0 0 6 0Z" />
  </Base>
);

export const PlayIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 5v14l11-7Z" />
  </Base>
);

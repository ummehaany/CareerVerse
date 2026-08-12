import { cn } from "@/lib/utils";

/** Neutral loading placeholder. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("cv-skeleton rounded-md", className)} aria-hidden="true" />;
}

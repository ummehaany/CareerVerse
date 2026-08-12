import Image from "next/image";
import { cn } from "@/lib/utils";

/** The compass emblem, cropped from the master logo. Self-contained dark tile. */
export function BrandMark({
  size = 32,
  rounded = true,
  className,
  priority = false,
}: {
  size?: number;
  rounded?: boolean;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/careerverse-mark.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 object-cover", rounded && "rounded-lg", className)}
    />
  );
}

/** Emblem + "CareerVerse AI" wordmark. Text colour follows the current theme. */
export function Logo({
  size = 32,
  showText = true,
  className,
  textClassName,
  priority = false,
}: {
  size?: number;
  showText?: boolean;
  className?: string;
  textClassName?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark size={size} priority={priority} />
      {showText && (
        <span className={cn("inline-flex items-center gap-1.5 font-bold tracking-tight", textClassName)}>
          CareerVerse
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[0.65em] font-semibold uppercase leading-none text-primary ring-1 ring-inset ring-primary/25">
            AI
          </span>
        </span>
      )}
    </span>
  );
}

/** The full master lockup (emblem + wordmark + tagline) on its own dark canvas. */
export function BrandLockup({
  className,
  width = 360,
  height = 360,
  priority = true,
}: {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/careerverse-logo.png"
      alt="CareerVerse AI — Experience your future before choosing it."
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-full max-w-full", className)}
    />
  );
}

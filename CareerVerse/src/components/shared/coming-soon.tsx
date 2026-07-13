import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/icon";
import { PageHeader } from "./page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Placeholder body for feature routes whose layout/navigation exist but whose
 * functionality lands in a later phase. Keeps the shell navigable end-to-end.
 */
export function ComingSoon({
  title,
  description,
  icon: Icon,
  bullets,
}: {
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
  bullets?: string[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={<Badge variant="muted">Coming soon</Badge>}
      />
      <Card className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon size={28} />
        </span>
        <div className="space-y-1">
          <p className="font-medium">This feature is being built</p>
          <p className="mx-auto max-w-md text-sm text-muted">
            The layout and navigation are ready. The interactive experience arrives in an upcoming
            phase.
          </p>
        </div>
        {bullets && bullets.length > 0 && (
          <ul className="mx-auto grid max-w-md gap-2 text-left text-sm text-muted">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                {b}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

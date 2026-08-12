"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon } from "@/components/ui/icons-extended";

/** Print toolbar for the public resume page (hidden when printing). */
export function PrintBar({ name }: { name: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
      <p className="text-sm text-muted">{name}&apos;s resume</p>
      <Button size="sm" onClick={() => window.print()}>
        <DownloadIcon size={15} /> Print / Save as PDF
      </Button>
    </div>
  );
}

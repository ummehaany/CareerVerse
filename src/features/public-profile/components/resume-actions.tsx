"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon, ExternalLinkIcon } from "@/components/ui/icons-extended";
import { recordResumeDownload } from "../actions";

export function ResumeActions({ username }: { username: string }) {
  const resumePath = `/u/${username}/resume`;
  const open = (download: boolean) => {
    if (download) void recordResumeDownload(username);
    window.open(resumePath, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={() => open(false)}>
        <ExternalLinkIcon size={15} /> View resume
      </Button>
      <Button size="sm" onClick={() => open(true)}>
        <DownloadIcon size={15} /> Download PDF
      </Button>
    </div>
  );
}

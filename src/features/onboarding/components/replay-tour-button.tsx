"use client";

import { Button } from "@/components/ui/button";
import { SparklesIcon } from "@/components/ui/icon";
import { START_TOUR_EVENT } from "../steps";

/** Settings control that replays the product tour on demand. */
export function ReplayTourButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => window.dispatchEvent(new CustomEvent(START_TOUR_EVENT))}
    >
      <SparklesIcon size={16} /> Take product tour again
    </Button>
  );
}

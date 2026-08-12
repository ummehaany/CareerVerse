"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { StarIcon, BookmarkIcon, BookmarkFilledIcon } from "@/components/ui/icons-extended";
import { toggleSavedCompanyAction, toggleDreamCompanyAction } from "../actions";

/** Save + "Target company" toggles wired to the server actions with optimistic UI. */
export function SaveButtons({
  slug,
  initialSaved,
  initialDream,
}: {
  slug: string;
  initialSaved: boolean;
  initialDream: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [dream, setDream] = useState(initialDream);
  const [pending, startTransition] = useTransition();

  function onSave() {
    setSaved((v) => !v);
    startTransition(async () => {
      const res = await toggleSavedCompanyAction(slug);
      if (res.ok) setSaved(res.active);
    });
  }

  function onDream() {
    setDream((v) => !v);
    startTransition(async () => {
      const res = await toggleDreamCompanyAction(slug);
      if (res.ok) setDream(res.active);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant={saved ? "primary" : "outline"} size="sm" onClick={onSave} disabled={pending}>
        {saved ? <BookmarkFilledIcon size={15} /> : <BookmarkIcon size={15} />}
        {saved ? "Saved" : "Save"}
      </Button>
      <Button type="button" variant={dream ? "primary" : "outline"} size="sm" onClick={onDream} disabled={pending}>
        <StarIcon size={15} />
        {dream ? "Target company" : "Mark as target"}
      </Button>
    </div>
  );
}

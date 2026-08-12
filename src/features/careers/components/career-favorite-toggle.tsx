"use client";

import { useState } from "react";
import { FavoriteButton } from "./favorite-button";
import { toggleFavoriteCareer } from "../actions";

export function CareerFavoriteToggle({
  slug,
  initialFavorited,
}: {
  slug: string;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);

  async function toggle() {
    const next = !favorited;
    setFavorited(next);
    const result = await toggleFavoriteCareer({ slug, favorite: next });
    if (!result.ok) setFavorited(!next);
  }

  return <FavoriteButton favorited={favorited} onToggle={toggle} withLabel />;
}

"use client";

import { useEffect } from "react";
import { pushRecentlyViewed } from "../explorer-hooks";

/** Invisible client helper: records a career as recently viewed when its detail page mounts. */
export function RecordRecentlyViewed({ slug }: { slug: string }) {
  useEffect(() => {
    pushRecentlyViewed(slug);
  }, [slug]);
  return null;
}

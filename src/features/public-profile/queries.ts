import { getCurrentUser } from "@/lib/firebase/auth";
import { siteConfig } from "@/config/site";
import { ensureUsername } from "@/lib/firebase/firestore/username";
import { getPublicProfileMeta } from "@/lib/firebase/firestore/public-profile";
import { normalizeProfileSections, type ProfileVisibility, type PublicSection } from "@/lib/profile/public-config";

export interface PublicProfileSettingsData {
  signedIn: boolean;
  username: string;
  visibility: ProfileVisibility;
  sections: Record<PublicSection, boolean>;
  profileUrl: string;
  profilePath: string;
  stats: { views: number; resumeDownloads: number; shares: number };
  hasAiSummary: boolean;
}

/** Settings view for the owner (ensures a handle exists lazily). */
export async function getPublicProfileSettings(): Promise<PublicProfileSettingsData | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const username = await ensureUsername(user.uid, user.displayName, user.email);
  const meta = await getPublicProfileMeta(user.uid);
  const base = siteConfig.url.replace(/\/$/, "");

  return {
    signedIn: true,
    username,
    visibility: user.profileVisibility ?? "unlisted",
    sections: normalizeProfileSections(user.profileSections),
    profileUrl: `${base}/u/${username}`,
    profilePath: `/u/${username}`,
    stats: { views: meta.views, resumeDownloads: meta.resumeDownloads, shares: meta.shares },
    hasAiSummary: Boolean(meta.aiSummary),
  };
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/config/routes";
import { resolvePublicUid, buildPublicProfile } from "@/features/public-profile/service";
import { incrementProfileStat } from "@/lib/firebase/firestore/public-profile";
import { PublicProfileView } from "@/features/public-profile/components/public-profile-view";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const uid = await resolvePublicUid(username);
  if (!uid) return { title: "Profile not found — CareerVerse" };
  const data = await buildPublicProfile(uid, false);
  if (!data || data.visibility === "private") {
    return { title: "Private profile — CareerVerse", robots: { index: false, follow: false } };
  }
  const title = `${data.name} — ${data.headline} | CareerVerse`;
  const description = (data.aiSummary || `${data.name}'s CareerVerse profile.`).slice(0, 200);
  const url = `${siteConfig.url.replace(/\/$/, "")}/u/${username}`;
  const indexable = data.visibility === "public";
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title, description, url, type: "profile", siteName: "CareerVerse" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const uid = await resolvePublicUid(username);
  if (!uid) notFound();

  const decoded = await verifySession();
  const isOwner = decoded?.uid === uid;

  const data = await buildPublicProfile(uid, isOwner);
  if (!data) notFound();

  // Private → only the owner may view.
  if (data.visibility === "private" && !isOwner) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-bold">This profile is private</h1>
        <p className="mt-2 text-sm text-muted">The owner hasn&apos;t made this CareerVerse profile public.</p>
        <Link href={ROUTES.home} className="mt-5 text-sm font-semibold text-primary hover:underline">Go to CareerVerse</Link>
      </div>
    );
  }

  // Private analytics: count views from non-owners (fire-and-forget).
  if (!isOwner) void incrementProfileStat(uid, "views");

  return <PublicProfileView data={data} />;
}

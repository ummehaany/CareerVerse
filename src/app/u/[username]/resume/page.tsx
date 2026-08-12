import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { getUser } from "@/lib/firebase/firestore/users";
import { getPrimaryResume } from "@/lib/firebase/firestore/resumes";
import { incrementProfileStat, readSections } from "@/lib/firebase/firestore/public-profile";
import { resolvePublicUid } from "@/features/public-profile/service";
import { ResumePreview } from "@/features/resume/components/resume-preview";
import { PrintBar } from "@/features/public-profile/components/print-bar";
import type { ResumeData } from "@/types/resume";

export const metadata: Metadata = { title: "Resume — CareerVerse", robots: { index: false, follow: false } };

interface Props {
  params: Promise<{ username: string }>;
}

export default async function PublicResumePage({ params }: Props) {
  const { username } = await params;
  const uid = await resolvePublicUid(username);
  if (!uid) notFound();

  const [user, resume, decoded] = await Promise.all([getUser(uid), getPrimaryResume(uid), verifySession()]);
  const isOwner = decoded?.uid === uid;
  const visibility = user?.profileVisibility ?? "unlisted";
  const sections = readSections(user);

  if (!resume) notFound();
  if (!isOwner && (visibility === "private" || !sections.resume)) notFound();

  if (!isOwner) void incrementProfileStat(uid, "resumeDownloads");

  const name = user?.displayName ?? resume.contact?.fullName ?? "Resume";

  return (
    <div className="min-h-screen bg-foreground/[0.03] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <PrintBar name={name} />
        <div className="overflow-hidden rounded-xl bg-white shadow-md">
          <ResumePreview resume={resume as ResumeData} />
        </div>
      </div>
    </div>
  );
}

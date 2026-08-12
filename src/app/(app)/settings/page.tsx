import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/firebase/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { EditProfileCard } from "@/features/profile/components/edit-profile-card";
import { Badge } from "@/components/ui/badge";
import { CopyableId } from "@/components/ui/copyable-id";
import { UserIcon, ShieldIcon } from "@/components/ui/icon";
import { LinkIcon, DownloadIcon } from "@/components/ui/icons-extended";
import { ROUTES } from "@/config/routes";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { AccountSecurity } from "@/features/auth/components/account-security";
import { ConnectedAccounts } from "@/features/auth/components/connected-accounts";
import { AppearanceSettings } from "@/features/appearance/components/appearance-settings";
import { getSubscriptionSnapshot } from "@/lib/firebase/firestore/subscription";
import { SubscriptionSettings } from "@/features/subscription/components/subscription-settings";
import { NotificationSettings, PrivacySettings } from "@/features/settings/components/preferences";
import { getPublicProfileSettings } from "@/features/public-profile/queries";
import { PublicProfileSettings } from "@/features/public-profile/settings-panel";
import { DeleteAccountCard } from "@/features/account/components/delete-account-card";
import { ReplayTourButton } from "@/features/onboarding/components/replay-tour-button";
import { SparklesIcon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Settings" };

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-3 first:border-t-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

function providerName(provider: string | null | undefined): string {
  switch (provider) {
    case "google.com":
      return "Google";
    case "github.com":
      return "GitHub";
    case "password":
      return "Email & password";
    default:
      return "Email & password";
  }
}

function SectionHeader({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <div>
        <h2 className="font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const subscription = user ? await getSubscriptionSnapshot(user.uid) : null;
  const publicProfile = await getPublicProfileSettings();

  const provider = user?.provider ?? null;
  const isEmailUser = provider === "password" || provider === null || provider === undefined;
  const memberSince = user?.createdAt
    ? user.createdAt.toDate().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <PageHeader title="Settings" description="Manage your account, preferences, privacy, and data." />

      {/* Edit Profile */}
      <Card className="space-y-5">
        <SectionHeader icon={<UserIcon size={16} />} title="Edit Profile" description="Update your profile photo and display name." />
        {user && (
          <EditProfileCard
            uid={user.uid}
            displayName={user.displayName}
            email={user.email}
            photoURL={user.photoURL}
          />
        )}
        <div className="border-t border-border pt-4">
          <Row label="Email">{user?.email ?? "—"}</Row>
          <Row label="Login provider">{providerName(provider)}</Row>
          <Row label="Account type">
            <span className="capitalize">{user?.role ?? "student"}</span>
          </Row>
          <Row label="Plan">
            <Badge variant={user?.plan === "pro" ? "primary" : "muted"} className="capitalize">
              {user?.plan ?? "free"} plan
            </Badge>
          </Row>
        </div>
      </Card>

      {/* Subscription */}
      {subscription && <SubscriptionSettings snapshot={subscription} />}

      {/* Appearance */}
      <AppearanceSettings />

      {/* Product tour */}
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader icon={<SparklesIcon size={16} />} title="Product tour" description="Replay the guided tour of CareerVerse anytime." />
          <ReplayTourButton />
        </div>
      </Card>

      {/* Public profile */}
      {publicProfile && <PublicProfileSettings data={publicProfile} />}

      {/* Privacy */}
      <PrivacySettings initial={user?.privacyPreferences} />

      {/* Notifications */}
      <NotificationSettings initial={user?.emailPreferences} />

      {/* Security */}
      <Card className="space-y-4">
        <SectionHeader icon={<ShieldIcon size={16} />} title="Security" description="Password and sign-in protection." />
        <AccountSecurity
          email={user?.email ?? null}
          isEmailUser={isEmailUser}
          providerLabel={providerName(provider)}
        />
      </Card>

      {/* Connected Accounts */}
      <Card className="space-y-4">
        <SectionHeader icon={<LinkIcon size={16} />} title="Connected Accounts" description="Link sign-in providers to your account." />
        <ConnectedAccounts />
      </Card>

      {/* Data & Export */}
      <Card className="space-y-4">
        <SectionHeader icon={<DownloadIcon size={16} />} title="Data & Export" description="Download a copy of your CareerVerse data." />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Export your full career profile — identity, goals, and statistics — as a JSON file from your profile page.
          </p>
          <Link
            href={ROUTES.profile}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-foreground/5"
          >
            <DownloadIcon size={16} /> Export profile
          </Link>
        </div>
        <p className="text-xs text-subtle">A complete account data export (all modules) is coming soon.</p>
      </Card>

      {/* Delete Account */}
      <DeleteAccountCard />

      {/* Session */}
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold tracking-tight">Session</h2>
            <p className="text-sm text-muted">You&apos;re signed in on this device.</p>
          </div>
          <SignOutButton />
        </div>
        <div>
          <Row label="Account ID">
            {user?.uid ? <CopyableId value={user.uid} label="account ID" /> : "—"}
          </Row>
          <Row label="Signed in with">{providerName(provider)}</Row>
          <Row label="Member since">{memberSince}</Row>
          <Row label="Session">Stays signed in for up to 5 days</Row>
        </div>
      </Card>
    </div>
  );
}

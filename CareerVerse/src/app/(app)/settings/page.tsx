import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";
import { SettingsIcon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Manage your account, notifications, plan, and privacy."
      icon={SettingsIcon}
      bullets={[
        "Account and profile preferences",
        "Notification controls",
        "Plan and billing, plus account danger zone",
      ]}
    />
  );
}

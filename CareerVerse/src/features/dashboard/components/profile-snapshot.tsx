import Link from "next/link";
import type { SessionUser } from "@/types/session";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRightIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";

export function ProfileSnapshot({
  user,
  completeness,
  onboardingComplete,
}: {
  user: SessionUser;
  completeness: number;
  onboardingComplete: boolean;
}) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar name={user.displayName} email={user.email} src={user.photoURL} size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{user.displayName ?? "Your profile"}</p>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="primary" className="capitalize">
          {user.role}
        </Badge>
        <Badge variant="muted" className="capitalize">
          {user.plan} plan
        </Badge>
        {onboardingComplete ? (
          <Badge variant="success">Onboarded</Badge>
        ) : (
          <Badge variant="warning">Setup incomplete</Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Profile completeness</span>
          <span className="font-medium tabular-nums">{completeness}%</span>
        </div>
        <Progress value={completeness} label="Profile completeness" />
      </div>

      <Link
        href={ROUTES.profile}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        {onboardingComplete ? "View & edit profile" : "Finish setting up"}
        <ArrowRightIcon size={15} />
      </Link>
    </Card>
  );
}

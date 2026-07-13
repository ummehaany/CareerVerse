import { Skeleton } from "@/components/ui/skeleton";

export default function CoachLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Skeleton className="h-9 w-52" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function AchievementsLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Skeleton className="h-9 w-52" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-32 rounded-2xl sm:col-span-2" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

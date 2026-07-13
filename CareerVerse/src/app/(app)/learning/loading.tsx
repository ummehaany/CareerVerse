import { Skeleton } from "@/components/ui/skeleton";

export default function LearningLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-9 w-52" />
      <Skeleton className="h-10 w-full rounded-md" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

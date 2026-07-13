import { Skeleton } from "@/components/ui/skeleton";

export default function CompareLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Skeleton className="h-9 w-52" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

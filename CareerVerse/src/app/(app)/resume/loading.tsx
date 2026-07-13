import { Skeleton } from "@/components/ui/skeleton";

export default function ResumeLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Skeleton className="h-9 w-52" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}

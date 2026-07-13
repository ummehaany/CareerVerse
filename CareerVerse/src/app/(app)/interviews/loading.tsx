import { Skeleton } from "@/components/ui/skeleton";

export default function InterviewsLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Skeleton className="h-9 w-52" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

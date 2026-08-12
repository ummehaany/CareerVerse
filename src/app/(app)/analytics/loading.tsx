/** Loading skeleton for Career Analytics. */
export default function AnalyticsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-72 rounded bg-foreground/10" />
        <div className="h-4 w-2/3 rounded bg-foreground/10" />
      </div>
      <div className="h-44 w-full animate-pulse rounded-xl border border-foreground/10 bg-background" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl border border-foreground/10 bg-background" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-foreground/10 bg-background p-6">
            <div className="h-4 w-1/3 rounded bg-foreground/10" />
            <div className="mt-4 h-32 w-full rounded bg-foreground/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

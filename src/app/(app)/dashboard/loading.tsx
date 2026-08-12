/** Loading skeleton for the Dashboard. */
export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* welcome banner */}
      <div className="h-28 w-full animate-pulse rounded-2xl border border-foreground/10 bg-background" />

      {/* intelligence hero */}
      <div className="h-48 w-full animate-pulse rounded-3xl border border-foreground/10 bg-background" />

      {/* recommended-for-you grid */}
      <div className="space-y-3">
        <div className="h-4 w-48 animate-pulse rounded bg-foreground/10" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-foreground/10 bg-background" />
          ))}
        </div>
      </div>

      {/* main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl border border-foreground/10 bg-background" />
            ))}
          </div>
        </div>
        <div className="h-64 animate-pulse rounded-xl border border-foreground/10 bg-background" />
      </div>
    </div>
  );
}

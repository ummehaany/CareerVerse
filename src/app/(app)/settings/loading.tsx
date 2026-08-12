/** Loading skeleton for Settings. */
export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-64 rounded bg-foreground/10" />
        <div className="h-4 w-2/3 rounded bg-foreground/10" />
      </div>
      <div className="h-40 w-full animate-pulse rounded-2xl border border-foreground/10 bg-background" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-foreground/10 bg-background" />
        ))}
      </div>
    </div>
  );
}

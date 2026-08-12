/** Loading skeleton for the Target Companies home. */
export default function CompaniesLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-64 rounded bg-foreground/10" />
        <div className="h-4 w-2/3 rounded bg-foreground/10" />
      </div>
      <div className="h-40 w-full animate-pulse rounded-xl border border-foreground/10 bg-background" />
      <div className="h-10 w-full animate-pulse rounded-md bg-foreground/10" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-foreground/10 bg-background">
            <div className="h-20 bg-foreground/10" />
            <div className="space-y-3 p-5 pt-8">
              <div className="h-4 w-1/2 rounded bg-foreground/10" />
              <div className="h-3 w-full rounded bg-foreground/10" />
              <div className="h-3 w-2/3 rounded bg-foreground/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

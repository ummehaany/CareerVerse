/** Loading skeleton for a company profile page. */
export default function CompanyLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="h-48 w-full animate-pulse rounded-2xl border border-foreground/10 bg-background" />
      <div className="h-11 w-full animate-pulse rounded-lg bg-foreground/10" />
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-foreground/10 bg-background p-6">
            <div className="h-4 w-1/3 rounded bg-foreground/10" />
            <div className="mt-4 h-3 w-full rounded bg-foreground/10" />
            <div className="mt-2 h-3 w-2/3 rounded bg-foreground/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

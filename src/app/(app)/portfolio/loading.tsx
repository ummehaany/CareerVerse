/** Route-level loading skeleton for the Smart Profile & Portfolio page. */
export default function PortfolioLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-72 rounded bg-foreground/10" />
        <div className="h-4 w-2/3 rounded bg-foreground/10" />
      </div>
      <div className="h-9 w-56 animate-pulse rounded-lg bg-foreground/10" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-foreground/10 bg-background p-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-foreground/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-foreground/10" />
                  <div className="h-3 w-2/3 rounded bg-foreground/10" />
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="h-10 rounded-md bg-foreground/10" />
                <div className="h-10 rounded-md bg-foreground/10" />
              </div>
            </div>
          ))}
        </div>
        <div className="animate-pulse rounded-xl border border-foreground/10 bg-background p-6">
          <div className="h-4 w-1/2 rounded bg-foreground/10" />
          <div className="mt-4 h-24 w-full rounded-xl bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}

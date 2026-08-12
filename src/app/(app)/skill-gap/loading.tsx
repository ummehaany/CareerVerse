/**
 * Route-level loading skeleton for the Skill Gap Analysis page.
 * Mirrors the header + two-column assess layout so the transition feels stable.
 */
export default function SkillGapLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-3">
        <div className="h-3 w-40 rounded bg-foreground/10" />
        <div className="h-8 w-3/4 rounded bg-foreground/10" />
        <div className="h-4 w-2/3 rounded bg-foreground/10" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {[0, 1].map((i) => (
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
              <div className="mt-4 h-10 w-full rounded-md bg-foreground/10" />
            </div>
          ))}
        </div>
        <div className="animate-pulse rounded-xl border border-foreground/10 bg-background p-6">
          <div className="h-4 w-1/2 rounded bg-foreground/10" />
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 w-full rounded-md bg-foreground/10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

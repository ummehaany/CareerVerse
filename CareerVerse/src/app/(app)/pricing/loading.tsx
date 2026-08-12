/** Loading skeleton for Pricing. */
export default function PricingLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-48 rounded bg-foreground/10" />
        <div className="h-4 w-2/3 rounded bg-foreground/10" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl border border-foreground/10 bg-background" />
        ))}
      </div>
      <div className="h-64 w-full animate-pulse rounded-2xl border border-foreground/10 bg-background" />
    </div>
  );
}

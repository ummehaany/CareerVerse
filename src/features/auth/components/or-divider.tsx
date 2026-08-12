export function OrDivider() {
  return (
    <div className="flex items-center gap-3 py-1" aria-hidden="true">
      <span className="h-px flex-1 bg-foreground/10" />
      <span className="text-xs text-foreground/40">or</span>
      <span className="h-px flex-1 bg-foreground/10" />
    </div>
  );
}

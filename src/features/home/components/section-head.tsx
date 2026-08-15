export function SectionHead({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      <h2 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {subtitle && <p className={`mt-2 text-sm text-muted sm:text-base ${align === "center" ? "mx-auto max-w-xl" : "max-w-xl"}`}>{subtitle}</p>}
    </div>
  );
}

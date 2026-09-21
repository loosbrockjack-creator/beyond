import { cn } from "@/lib/cn";

export function Page({
  children,
  wide = false,
  className,
}: {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 py-12 md:px-12 lg:py-20",
        wide ? "max-w-6xl" : "max-w-4xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageTitle({
  label,
  title,
  lead,
}: {
  label: string;
  title: string;
  lead?: string | null;
}) {
  return (
    <header className="mb-14">
      <span className="label">{label}</span>
      <h1 className="mt-3 text-3xl font-medium tracking-[-0.025em] text-ink">{title}</h1>
      {lead ? <p className="mt-4 max-w-[62ch] text-muted">{lead}</p> : null}
    </header>
  );
}

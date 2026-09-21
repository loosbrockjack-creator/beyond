import { cn } from "@/lib/cn";

/** The wide-tracked uppercase eyebrow. The app's signature type treatment. */
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("label block", className)}>{children}</span>;
}

/** A label with a hairline running to the end of the container. */
export function SectionHeader({
  children,
  right,
  className,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="label shrink-0">{children}</span>
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
      {right ? <span className="shrink-0 text-xs text-muted">{right}</span> : null}
    </div>
  );
}

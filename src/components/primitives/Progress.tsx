import { cn } from "@/lib/cn";

export function Progress({
  value,
  max,
  className,
  muted = false,
}: {
  value: number;
  max: number;
  className?: string;
  muted?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("h-px w-full overflow-hidden bg-line-strong", className)}
    >
      <div
        className={cn(
          "h-full transition-[width] duration-500 ease-out-quart",
          muted ? "bg-faint" : "bg-accent",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Discrete segments, one per topic. Reads better than a bar at 4 units. */
export function Segments({
  total,
  filled,
  muted = false,
  className,
}: {
  total: number;
  filled: number;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1", className)} aria-label={`${filled} of ${total} complete`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-0.5 flex-1 rounded-full transition-colors duration-300",
            i < filled ? (muted ? "bg-faint" : "bg-accent") : "bg-line-strong",
          )}
        />
      ))}
    </div>
  );
}

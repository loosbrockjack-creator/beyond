import { cn } from "@/lib/cn";

export function Stat({
  value,
  label,
  accent = false,
  className,
}: {
  value: React.ReactNode;
  label: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span
        className={cn(
          "num text-2xl leading-none tracking-tight",
          accent ? "text-accent" : "text-ink",
        )}
      >
        {value}
      </span>
      <span className="label">{label}</span>
    </div>
  );
}

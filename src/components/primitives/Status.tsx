import { Lock, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TopicStatus } from "@/lib/gating";

/**
 * Status is carried by weight and wording, not by hue. The accent marks a pass;
 * everything else is neutral. Keeps the palette to one color.
 */
export function StatusMark({ status }: { status: TopicStatus }) {
  if (status === "complete") {
    return <Check className="size-3.5 shrink-0 text-accent" aria-label="Complete" />;
  }
  if (status === "locked") {
    return <Lock className="size-3 shrink-0 text-faint" aria-label="Locked" />;
  }
  return (
    <span
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        status === "in_progress" ? "bg-accent" : "bg-faint",
      )}
      aria-label={status === "in_progress" ? "In progress" : "Available"}
    />
  );
}

export function StatusText({ status }: { status: TopicStatus }) {
  const text: Record<TopicStatus, string> = {
    complete: "Complete",
    in_progress: "In progress",
    available: "Available",
    locked: "Locked",
  };
  return (
    <span className={cn("label", status === "locked" && "text-faint")}>{text[status]}</span>
  );
}

export function LockedNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 border border-line bg-surface px-5 py-4">
      <Lock className="mt-0.5 size-4 shrink-0 text-faint" aria-hidden="true" />
      <p className="text-sm text-muted">{children}</p>
    </div>
  );
}

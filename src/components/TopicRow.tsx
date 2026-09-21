import Link from "next/link";
import { StatusMark } from "@/components/primitives/Status";
import { formatDate } from "@/lib/schedule";
import type { TopicView } from "@/lib/course";
import { cn } from "@/lib/cn";

export function TopicRow({ view, showWeek = true }: { view: TopicView; showWeek?: boolean }) {
  const { topic, status, due, overdue, submission } = view;
  const locked = status === "locked";
  const number = String(topic.number).padStart(2, "0");

  const right = locked
    ? "Locked"
    : submission?.total_score != null
      ? String(submission.total_score)
      : overdue
        ? "Overdue"
        : formatDate(due);

  const inner = (
    <div className="flex items-center gap-4 py-4">
      <span className="flex w-4 justify-center">
        <StatusMark status={status} />
      </span>

      {showWeek ? (
        <span className={cn("num w-6 text-xs", locked ? "text-faint" : "text-muted")}>{number}</span>
      ) : null}

      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm", locked ? "text-muted" : "text-ink")}>
          {topic.title}
        </span>
      </span>

      <span
        className={cn(
          "num shrink-0 text-right text-xs",
          overdue && !locked ? "text-ink" : "text-muted",
          locked && "text-faint",
        )}
      >
        {right}
      </span>
    </div>
  );

  if (locked) {
    return <li className="border-b border-line px-2 opacity-70">{inner}</li>;
  }

  return (
    <li className="border-b border-line">
      <Link
        href={`/m/${view.moduleSlug}/topics/${topic.slug}`}
        className="block px-2 transition-colors duration-150 ease-out-quart hover:bg-raised"
      >
        {inner}
      </Link>
    </li>
  );
}

import Link from "next/link";
import { Check, ArrowUpRight } from "lucide-react";
import type { SessionView } from "@/lib/course";
import { cn } from "@/lib/cn";

const KIND_LABEL: Record<string, string> = {
  article: "article",
  video: "video",
  doc: "doc",
  paper: "paper",
  repo: "repo",
  other: "link",
};

export function SessionList({
  sessions,
  basePath,
}: {
  sessions: SessionView[];
  basePath: string;
}) {
  return (
    <ul>
      {sessions.map((sv, i) => {
        const { session, progress, done } = sv;
        const scored = progress?.total_count ? `${progress.correct_count}/${progress.total_count}` : null;

        return (
          <li key={session.id} className="border-b border-line">
            <Link
              href={`${basePath}/sessions/${session.order_index}`}
              className="flex items-start gap-4 px-2 py-4 transition-colors duration-150 hover:bg-raised"
            >
              <span className="mt-0.5 flex w-4 shrink-0 justify-center">
                {done ? (
                  <Check className="size-3.5 text-accent" aria-label="Done" />
                ) : (
                  <span className="size-1.5 rounded-full bg-faint" aria-hidden="true" />
                )}
              </span>

              <span className="num mt-0.5 w-5 shrink-0 text-xs text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="min-w-0 flex-1">
                <span className={cn("block text-sm", done ? "text-muted" : "text-ink")}>
                  {session.title}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="label">{KIND_LABEL[session.source_kind] ?? "link"}</span>
                  {session.est_minutes ? (
                    <span className="num text-2xs text-faint">{session.est_minutes} min</span>
                  ) : null}
                  {scored ? <span className="num text-2xs text-faint">recall {scored}</span> : null}
                </span>
              </span>

              <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-faint" aria-hidden="true" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

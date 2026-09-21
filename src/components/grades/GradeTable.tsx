import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { gradeFor } from "@/lib/gpa";
import type { TopicView } from "@/lib/course";
import { cn } from "@/lib/cn";

export function GradeTable({ topics }: { topics: TopicView[] }) {
  return (
    <div>
      <div className="grid grid-cols-[1.5rem_1fr_3rem_3.5rem_2.5rem] items-center gap-x-4 border-b border-line pb-2.5 sm:grid-cols-[1.5rem_1fr_4rem_4rem_3rem]">
        <span className="label">Wk</span>
        <span className="label">Topic</span>
        <span className="label text-right">Quiz</span>
        <span className="label text-right">Project</span>
        <span className="label text-right">Grade</span>
      </div>

      <ul>
        {topics.map((t) => {
          const locked = t.status === "locked";
          const passed = t.status === "complete";
          const score = t.submission?.total_score ?? null;
          const grade = score != null ? gradeFor(score) : null;
          const attempts = t.attempts.length;

          const row = (
            <div className="grid grid-cols-[1.5rem_1fr_3rem_3.5rem_2.5rem] items-center gap-x-4 py-3.5 sm:grid-cols-[1.5rem_1fr_4rem_4rem_3rem]">
              <span className={cn("num text-xs", locked ? "text-faint" : "text-muted")}>
                {String(t.topic.week_number).padStart(2, "0")}
              </span>

              <span className="flex min-w-0 items-center gap-2">
                {locked ? <Lock className="size-3 shrink-0 text-faint" aria-hidden="true" /> : null}
                <span className={cn("truncate text-sm", locked ? "text-muted" : "text-ink")}>
                  {t.topic.title}
                </span>
                {t.late ? <span className="label shrink-0">late</span> : null}
              </span>

              <span className="flex items-center justify-end gap-1.5">
                {passed ? (
                  <Check className="size-3.5 text-accent" aria-label="Passed" />
                ) : (
                  <span className="text-faint">{"—"}</span>
                )}
                {attempts > 0 ? (
                  <span className="num text-2xs text-faint">{attempts}</span>
                ) : null}
              </span>

              <span className="num text-right text-sm">
                {score != null ? (
                  <span className="text-ink">{score}</span>
                ) : (
                  <span className="text-faint">{"—"}</span>
                )}
              </span>

              <span className="num text-right text-sm">
                {grade ? (
                  <span className="text-ink">{grade.letter}</span>
                ) : (
                  <span className="text-faint">{"—"}</span>
                )}
              </span>
            </div>
          );

          return (
            <li key={t.topic.id} className="border-b border-line">
              {locked ? (
                <div className="px-1 opacity-70">{row}</div>
              ) : (
                <Link
                  href={`/m/${t.moduleSlug}/topics/${t.topic.slug}`}
                  className="block px-1 transition-colors duration-150 hover:bg-raised"
                >
                  {row}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

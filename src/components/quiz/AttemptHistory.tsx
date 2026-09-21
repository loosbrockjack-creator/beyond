import { Check } from "lucide-react";
import type { QuizAttempt } from "@/lib/supabase/types";
import { formatDate } from "@/lib/schedule";
import { cn } from "@/lib/cn";

export function AttemptHistory({ attempts }: { attempts: QuizAttempt[] }) {
  if (attempts.length === 0) {
    return <p className="text-sm text-muted">No attempts yet.</p>;
  }

  return (
    <ul>
      {attempts.map((a) => (
        <li
          key={a.id}
          className="flex items-center justify-between gap-6 border-b border-line py-3"
        >
          <span className="flex items-center gap-3">
            <span className="flex w-4 justify-center">
              {a.passed ? <Check className="size-3.5 text-accent" aria-label="Passed" /> : null}
            </span>
            <span className="label">Attempt {String(a.attempt_number).padStart(2, "0")}</span>
          </span>
          <span className="flex items-baseline gap-6">
            <span className={cn("num text-sm", a.passed ? "text-accent" : "text-muted")}>
              {a.score}
            </span>
            <span className="num w-14 text-right text-xs text-faint">
              {formatDate(new Date(a.created_at))}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { QuizAttempt } from "@/lib/supabase/types";
import { formatDate } from "@/lib/schedule";
import { getAttemptReview, type AttemptReview } from "@/lib/actions/quiz";
import { QuizReview } from "@/components/quiz/QuizReview";
import { cn } from "@/lib/cn";

export function AttemptHistory({ attempts }: { attempts: QuizAttempt[] }) {
  if (attempts.length === 0) {
    return <p className="text-sm text-muted">No attempts yet.</p>;
  }

  return (
    <ul>
      {attempts.map((a) => (
        <AttemptRow key={a.id} attempt={a} />
      ))}
    </ul>
  );
}

function AttemptRow({ attempt: a }: { attempt: QuizAttempt }) {
  const [open, setOpen] = useState(false);
  const [review, setReview] = useState<AttemptReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (review || loading) return;
    setLoading(true);
    setError(null);
    try {
      setReview(await getAttemptReview(a.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load this attempt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="border-b border-line py-3">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-6 text-left"
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
      </button>

      {open ? (
        <div className="mt-4 pl-7">
          {loading ? <p className="text-sm text-muted">Loading…</p> : null}
          {error ? <p className="text-sm text-muted">{error}</p> : null}
          {review ? (
            <QuizReview
              questions={review.questions}
              answers={review.answers}
              correct={review.correct}
              explanations={review.explanations}
            />
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

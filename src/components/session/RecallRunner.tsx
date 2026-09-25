"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { submitRecall, type RecallResult } from "@/lib/actions/session";
import { cn } from "@/lib/cn";

export interface RecallQ {
  id: string;
  prompt: string;
  carried: boolean;
  options: { id: string; label: string }[];
}

/**
 * All questions on one page. At three questions, paging would be more clicking
 * than reading.
 */
export function RecallRunner({
  sessionId,
  questions,
  nextHref,
  topicHref,
}: {
  sessionId: string;
  questions: RecallQ[];
  nextHref: string | null;
  topicHref: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RecallResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = questions.every((q) => answers[q.id]);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      setResult(await submitRecall(sessionId, answers));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ol className="flex flex-col gap-10">
        {questions.map((q, i) => {
          const chosen = answers[q.id];
          const rightId = result?.correct[q.id];
          return (
            <li key={q.id}>
              <div className="flex items-baseline gap-3">
                <span className="num text-2xs text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {q.carried ? <span className="label text-accent">carried over</span> : null}
              </div>
              <p className="mt-2 text-base leading-snug font-medium text-ink">{q.prompt}</p>

              <div className="mt-4 flex flex-col gap-2">
                {q.options.map((o) => {
                  const isChosen = chosen === o.id;
                  const isRight = rightId === o.id;
                  const wrongPick = Boolean(result) && isChosen && !isRight;

                  return (
                    <label
                      key={o.id}
                      className={cn(
                        "flex items-start gap-3 border px-4 py-3 text-sm transition-colors duration-150",
                        result ? "cursor-default" : "cursor-pointer",
                        isRight && result
                          ? "border-accent bg-accent-dim text-ink"
                          : wrongPick
                            ? "border-line-strong text-muted"
                            : isChosen
                              ? "border-accent bg-accent-dim text-ink"
                              : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
                      )}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        disabled={Boolean(result)}
                        checked={isChosen}
                        onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                        className="sr-only"
                      />
                      <span aria-hidden="true" className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center">
                        {result && isRight ? (
                          <Check className="size-3.5 text-accent" />
                        ) : wrongPick ? (
                          <X className="size-3.5 text-faint" />
                        ) : (
                          <span
                            className={cn(
                              "size-3.5 rounded-full border",
                              isChosen ? "border-accent bg-accent" : "border-line-strong",
                            )}
                          />
                        )}
                      </span>
                      <span>{o.label}</span>
                    </label>
                  );
                })}
              </div>

              {result && result.explanations[q.id] ? (
                <p className="mt-3 max-w-[66ch] text-xs text-muted">{result.explanations[q.id]}</p>
              ) : null}
            </li>
          );
        })}
      </ol>

      {error ? (
        <p role="alert" className="mt-8 text-sm text-ink">
          {error}
        </p>
      ) : null}

      {!result ? (
        <div className="mt-10">
          <Button onClick={submit} loading={busy} disabled={!allAnswered}>
            Check answers
          </Button>
          <p className="mt-3 text-xs text-muted">
            Nothing here gates anything. The score is recorded so the weekly quiz knows what
            to push on.
          </p>
        </div>
      ) : (
        <div className="mt-12 border-t border-line pt-8">
          <div className="flex items-baseline gap-3">
            <span
              className={cn(
                "num text-2xl leading-none",
                result.correctCount === result.totalCount ? "text-accent" : "text-ink",
              )}
            >
              {result.correctCount}/{result.totalCount}
            </span>
            <span className="label">Session complete</span>
          </div>

          <div className="mt-6 flex gap-3">
            {nextHref ? (
              <Button onClick={() => (window.location.href = nextHref)}>
                Next session
                <ArrowRight className="size-3.5" />
              </Button>
            ) : (
              <Button onClick={() => (window.location.href = topicHref)}>
                Back to the week
                <ArrowRight className="size-3.5" />
              </Button>
            )}
            <Button variant="secondary" onClick={() => (window.location.href = topicHref)}>
              Week overview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

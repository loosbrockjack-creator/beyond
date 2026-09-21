"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { submitQuizAttempt, type AttemptResult } from "@/lib/actions/quiz";
import { cn } from "@/lib/cn";

export interface RunnerQuestion {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
}

function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** New question order and new option order, so a retake is not muscle memory. */
function reshuffle(questions: RunnerQuestion[]): RunnerQuestion[] {
  return shuffled(questions).map((q) => ({ ...q, options: shuffled(q.options) }));
}

export function QuizRunner({
  quizId,
  questions,
  topicTitle,
  topicHref,
  passThreshold,
}: {
  quizId: string;
  questions: RunnerQuestion[];
  topicTitle: string;
  topicHref: string;
  passThreshold: number;
}) {
  const router = useRouter();
  // First render keeps the server order so hydration matches. Retakes reshuffle.
  const [deck, setDeck] = useState(questions);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = deck[index];
  const isLast = index === deck.length - 1;
  const allAnswered = deck.every((q) => answers[q.id]);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitQuizAttempt(quizId, answers);
      setResult(res);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function retake() {
    setDeck(reshuffle(questions));
    setAnswers({});
    setIndex(0);
    setResult(null);
  }

  if (result) {
    return (
      <Result
        result={result}
        questions={deck}
        answers={answers}
        passThreshold={passThreshold}
        topicHref={topicHref}
        onRetake={retake}
      />
    );
  }

  return (
    <div>
      <div className="mb-10 flex items-center justify-between">
        <span className="label">
          Question {String(index + 1).padStart(2, "0")} of {String(deck.length).padStart(2, "0")}
        </span>
        <span className="label">{passThreshold}% to pass</span>
      </div>

      <div className="mb-10 flex gap-1" aria-hidden="true">
        {deck.map((q, i) => (
          <span
            key={q.id}
            className={cn(
              "h-0.5 flex-1 rounded-full transition-colors duration-300",
              i === index ? "bg-accent" : answers[q.id] ? "bg-line-strong" : "bg-line",
            )}
          />
        ))}
      </div>

      <h2 className="text-xl leading-snug font-medium tracking-[-0.02em] text-ink">
        {question.prompt}
      </h2>

      <fieldset className="mt-8">
        <legend className="sr-only">{question.prompt}</legend>
        <div className="flex flex-col gap-2">
          {question.options.map((o) => {
            const selected = answers[question.id] === o.id;
            return (
              <label
                key={o.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3.5 border px-5 py-4 text-sm",
                  "transition-colors duration-150 ease-out-quart",
                  selected
                    ? "border-accent bg-accent-dim text-ink"
                    : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={selected}
                  onChange={() => setAnswers((a) => ({ ...a, [question.id]: o.id }))}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 size-3.5 shrink-0 rounded-full border transition-colors duration-150",
                    selected ? "border-accent bg-accent" : "border-line-strong",
                  )}
                />
                <span>{o.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="mt-6 text-sm text-ink">
          {error}
        </p>
      ) : null}

      <div className="mt-10 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setIndex((i) => i - 1)}
          disabled={index === 0}
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>

        {isLast ? (
          <Button onClick={submit} loading={submitting} disabled={!allAnswered}>
            Submit
          </Button>
        ) : (
          <Button onClick={() => setIndex((i) => i + 1)} disabled={!answers[question.id]}>
            Next
          </Button>
        )}
      </div>

      <p className="mt-8 text-xs text-muted">
        <Link href={topicHref} className="transition-colors hover:text-ink">
          Leave quiz
        </Link>{" "}
        · {topicTitle}
      </p>
    </div>
  );
}

function Result({
  result,
  questions,
  answers,
  passThreshold,
  topicHref,
  onRetake,
}: {
  result: AttemptResult;
  questions: RunnerQuestion[];
  answers: Record<string, string>;
  passThreshold: number;
  topicHref: string;
  onRetake: () => void;
}) {
  const wrong = questions.filter((q) => answers[q.id] !== result.correct[q.id]);

  return (
    <div>
      <span className="label">Attempt {String(result.attemptNumber).padStart(2, "0")}</span>

      <div className="mt-4 flex items-baseline gap-4">
        <span className={cn("num text-4xl leading-none", result.passed ? "text-accent" : "text-ink")}>
          {result.score}
        </span>
        <span className="text-xl font-medium text-ink">
          {result.passed ? "Passed" : "Not passed"}
        </span>
      </div>

      <p className="mt-4 max-w-[60ch] text-muted">
        {result.passed
          ? "The next topic is now unlocked."
          : `You need ${passThreshold}% to unlock the next topic. Retake it as many times as you want, the attempts are all recorded.`}
      </p>

      {wrong.length > 0 ? (
        <section className="mt-12">
          <div className="flex items-center gap-4">
            <span className="label shrink-0">Missed {wrong.length}</span>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
          </div>

          <ul className="mt-6 flex flex-col gap-8">
            {wrong.map((q) => {
              const chosen = q.options.find((o) => o.id === answers[q.id]);
              const right = q.options.find((o) => o.id === result.correct[q.id]);
              return (
                <li key={q.id}>
                  <p className="text-sm font-medium text-ink">{q.prompt}</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <span className="flex items-start gap-2.5 text-sm text-muted">
                      <X className="mt-0.5 size-3.5 shrink-0 text-faint" aria-label="Your answer" />
                      {chosen?.label}
                    </span>
                    <span className="flex items-start gap-2.5 text-sm text-ink">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-label="Correct answer" />
                      {right?.label}
                    </span>
                  </div>
                  {result.explanations[q.id] ? (
                    <p className="mt-3 max-w-[62ch] text-xs text-muted">
                      {result.explanations[q.id]}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="mt-12 flex gap-3">
        {result.passed ? (
          <Button onClick={() => (window.location.href = topicHref)}>Back to topic</Button>
        ) : (
          <>
            <Button onClick={onRetake}>Retake</Button>
            <Button variant="secondary" onClick={() => (window.location.href = topicHref)}>
              Back to topic
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

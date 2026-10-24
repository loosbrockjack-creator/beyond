import { Check, X } from "lucide-react";

export interface ReviewQuestion {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
}

/** The missed-questions breakdown: chosen vs. correct answer, with explanation. */
export function QuizReview({
  questions,
  answers,
  correct,
  explanations,
}: {
  questions: ReviewQuestion[];
  answers: Record<string, string>;
  correct: Record<string, string>;
  explanations: Record<string, string | null>;
}) {
  const wrong = questions.filter((q) => answers[q.id] !== correct[q.id]);

  if (wrong.length === 0) {
    return <p className="text-sm text-muted">Every question in this attempt was correct.</p>;
  }

  return (
    <ul className="flex flex-col gap-8">
      {wrong.map((q) => {
        const chosen = q.options.find((o) => o.id === answers[q.id]);
        const right = q.options.find((o) => o.id === correct[q.id]);
        return (
          <li key={q.id}>
            <p className="text-sm font-medium text-ink">{q.prompt}</p>
            <div className="mt-3 flex flex-col gap-2">
              <span className="flex items-start gap-2.5 text-sm text-muted">
                <X className="mt-0.5 size-3.5 shrink-0 text-faint" aria-label="Your answer" />
                {chosen?.label ?? "No answer"}
              </span>
              <span className="flex items-start gap-2.5 text-sm text-ink">
                <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-label="Correct answer" />
                {right?.label}
              </span>
            </div>
            {explanations[q.id] ? (
              <p className="mt-3 max-w-[62ch] text-xs text-muted">{explanations[q.id]}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

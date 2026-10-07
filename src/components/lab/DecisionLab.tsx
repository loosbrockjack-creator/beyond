"use client";

import { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { cn } from "@/lib/cn";
import { scoreLab, type Answer, type Lab } from "@/lib/labs";

const CHOICES: { value: Answer; label: string }[] = [
  { value: "workflow", label: "Workflow" },
  { value: "agent", label: "Agent" },
];

/**
 * All three scenarios on one page, each revealing as soon as it is answered. Nothing is
 * persisted: the lab is practice, it gates nothing, and the brief rules out new tables.
 */
export function DecisionLab({ lab }: { lab: Lab }) {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  const answeredCount = lab.scenarios.filter((s) => answers[s.id]).length;
  const done = answeredCount === lab.scenarios.length;
  const score = scoreLab(lab, answers);
  const total = lab.scenarios.length;

  return (
    <div>
      <dl className="mb-12 border-y border-line">
        {CHOICES.map((c, i) => (
          <div
            key={c.value}
            className={cn("flex flex-col gap-1 py-4 sm:flex-row sm:gap-6", i > 0 && "border-t border-line")}
          >
            <dt className="label shrink-0 sm:w-28 sm:pt-0.5">{c.label}</dt>
            <dd className="max-w-[62ch] text-sm text-muted">{lab.rubric[c.value]}</dd>
          </div>
        ))}
      </dl>

      <ol className="flex flex-col gap-14">
        {lab.scenarios.map((s, i) => {
          const chosen = answers[s.id];
          const revealed = Boolean(chosen);
          const gotIt = chosen === s.answer;

          return (
            <li key={s.id}>
              <div className="flex items-baseline gap-3">
                <span className="num text-2xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="label">{s.title}</span>
              </div>

              <p className="mt-3 max-w-[66ch] text-base leading-relaxed text-ink">{s.body}</p>

              <fieldset className="mt-5" disabled={revealed}>
                <legend className="sr-only">
                  Is {s.title} a workflow or an agent?
                </legend>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {CHOICES.map((c) => {
                    const isChosen = chosen === c.value;
                    const isRight = s.answer === c.value;
                    const wrongPick = revealed && isChosen && !isRight;

                    return (
                      <label
                        key={c.value}
                        className={cn(
                          "flex flex-1 items-center gap-3 border px-4 py-3 text-sm transition-colors duration-150",
                          revealed ? "cursor-default" : "cursor-pointer",
                          revealed && isRight
                            ? "border-accent bg-accent-dim text-ink"
                            : wrongPick
                              ? "border-line-strong text-muted"
                              : revealed
                                ? "border-line text-faint"
                                : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
                        )}
                      >
                        <input
                          type="radio"
                          name={s.id}
                          checked={isChosen}
                          onChange={() => setAnswers((a) => ({ ...a, [s.id]: c.value }))}
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className="flex size-3.5 shrink-0 items-center justify-center"
                        >
                          {revealed && isRight ? (
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
                        <span>{c.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {revealed ? (
                <div className="mt-5 border-l border-line-strong pl-5">
                  <span className="label">{gotIt ? "Correct" : `Not this one, it is ${s.answer}`}</span>
                  <p className="mt-3 max-w-[66ch] text-sm leading-relaxed text-muted">
                    {s.explanation}
                  </p>

                  {s.attribution ? (
                    <dl className="mt-6 flex flex-col gap-4">
                      <div>
                        <dt className="label">Model</dt>
                        <dd className="mt-1.5 max-w-[62ch] text-sm text-muted">
                          {s.attribution.model}
                        </dd>
                      </div>
                      <div>
                        <dt className="label">Harness</dt>
                        <dd className="mt-1.5 max-w-[62ch] text-sm text-muted">
                          {s.attribution.harness}
                        </dd>
                      </div>
                      <div>
                        <dt className="label">Environment</dt>
                        <dd className="mt-1.5 max-w-[62ch] text-sm text-muted">
                          {s.attribution.environment}
                        </dd>
                      </div>
                    </dl>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-14 border-t border-line pt-8">
        <div className="flex items-baseline gap-3">
          <span
            className={cn(
              "num text-2xl leading-none",
              done && score === total ? "text-accent" : "text-ink",
            )}
            aria-live="polite"
          >
            {score}/{total}
          </span>
          <span className="label">
            {done ? "Lab complete" : `${answeredCount} of ${total} answered`}
          </span>
        </div>

        {done ? (
          <>
            <p className="mt-5 max-w-[62ch] text-sm text-muted">
              {score === total
                ? "All three on the control of the path, not on how capable the model was. That is the distinction week 1 is built on."
                : "Reread the one you missed and look only for the sentence that says who chose the next action. That is the whole test."}
            </p>
            <div className="mt-6">
              <Button variant="secondary" onClick={() => setAnswers({})}>
                <RotateCcw className="size-3.5" />
                Start over
              </Button>
            </div>
          </>
        ) : (
          <p className="mt-5 max-w-[62ch] text-sm text-muted">
            Each one reveals as soon as you answer it. Nothing here is recorded and nothing
            is gated, so guessing costs you only the explanation.
          </p>
        )}
      </div>
    </div>
  );
}

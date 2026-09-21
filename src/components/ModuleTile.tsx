import Link from "next/link";
import { Lock, ArrowUpRight } from "lucide-react";
import { Segments } from "@/components/primitives/Progress";
import { formatGpa } from "@/lib/gpa";
import type { ModuleView } from "@/lib/course";
import { cn } from "@/lib/cn";

export function ModuleTile({ view }: { view: ModuleView }) {
  const { module, topics, completeCount, locked, gpa } = view;
  const number = String(module.number).padStart(2, "0");

  const body = (
    <>
      <div className="flex items-start justify-between">
        <span className={cn("num text-sm tracking-[0.2em]", locked ? "text-faint" : "text-accent")}>
          {number}
        </span>
        {locked ? (
          <Lock className="size-3.5 text-faint" aria-label="Locked" />
        ) : (
          <ArrowUpRight className="size-4 text-faint transition-colors duration-150 group-hover:text-ink" />
        )}
      </div>

      <div className="mt-7">
        <h3 className="text-xl font-medium tracking-[-0.02em] text-ink">{module.title}</h3>
        <p className="mt-1.5 text-xs text-muted">{module.subtitle}</p>
      </div>

      <div className="mt-8">
        <Segments total={topics.length} filled={completeCount} muted={locked} />
        <div className="mt-3 flex items-baseline justify-between">
          <span className="label">
            {locked ? "Locked" : `${completeCount} of ${topics.length}`}
          </span>
          {!locked && gpa !== null ? (
            <span className="num text-sm text-ink">{formatGpa(gpa)}</span>
          ) : null}
        </div>
      </div>
    </>
  );

  if (locked) {
    return (
      <div className="border border-line bg-surface px-7 py-6 opacity-55">{body}</div>
    );
  }

  return (
    <Link
      href={`/m/${module.slug}`}
      className="group border border-line bg-surface px-7 py-6 transition-colors duration-150 ease-out-quart hover:border-line-strong hover:bg-raised"
    >
      {body}
    </Link>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { loadCourse } from "@/lib/course";
import { Page } from "@/components/primitives/Page";
import { SectionHeader } from "@/components/primitives/Label";
import { ModuleTile } from "@/components/ModuleTile";
import { formatGpa } from "@/lib/gpa";
import { relativeDue, formatDate, WEEKS_TOTAL } from "@/lib/schedule";

export default async function DashboardPage() {
  const course = await loadCourse();
  const active = course.active;

  return (
    <Page wide>
      <header className="mb-12">
        <span className="label">
          Week {String(course.week).padStart(2, "0")} of {WEEKS_TOTAL}
        </span>
        <h1 className="mt-3 text-3xl font-medium tracking-[-0.025em] text-ink">Dashboard</h1>
      </header>

      {/* Stats. The only numerals that get the accent are the ones that mean progress. */}
      <div className="mb-16 grid grid-cols-3 border-y border-line">
        <Cell value={`${course.completeCount}/${WEEKS_TOTAL}`} label="Topics complete" accent />
        <Cell value={formatGpa(course.gpa)} label="Course GPA" divided />
        <Cell value={String(course.week).padStart(2, "0")} label="Current week" divided />
      </div>

      <section className="mb-16">
        <SectionHeader>Up next</SectionHeader>
        {active ? (
          <Link
            href={`/m/${active.moduleSlug}/topics/${active.topic.slug}`}
            className="group mt-6 block"
          >
            <div className="flex items-baseline gap-4">
              <span className="num text-sm text-accent">
                {String(active.topic.number).padStart(2, "0")}
              </span>
              <h2 className="text-2xl font-medium tracking-[-0.025em] text-ink transition-colors duration-150">
                {active.topic.title}
              </h2>
              <ArrowRight className="size-4 shrink-0 translate-x-0 text-faint transition-all duration-150 ease-out-quart group-hover:translate-x-1 group-hover:text-ink" />
            </div>
            <p className="mt-3 max-w-[62ch] text-muted">{active.topic.summary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
              {active.sessions.length > 0 ? (
                <Meta
                  label="Sessions"
                  value={`${active.sessionsDone} of ${active.sessions.length} done`}
                />
              ) : null}
              <Meta
                label="Quiz"
                value={
                  !active.quizReady
                    ? "After the sessions"
                    : active.attempts.length > 0
                      ? `${active.attempts.length} attempts, not passed`
                      : "Not started"
                }
              />
              <Meta
                label="Project"
                value={
                  active.overdue
                    ? `Overdue, was due ${formatDate(active.due)}`
                    : `Due ${relativeDue(active.due)}`
                }
                strong={active.overdue}
              />
            </div>
          </Link>
        ) : (
          <p className="mt-6 text-muted">
            Every topic is complete. Sixteen weeks, done.
          </p>
        )}
      </section>

      <section className="mb-16">
        <SectionHeader>Modules</SectionHeader>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {course.modules.map((m) => (
            <ModuleTile key={m.module.id} view={m} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader>Recent</SectionHeader>
        <RecentActivity course={course} />
      </section>
    </Page>
  );
}

function Cell({
  value,
  label,
  accent = false,
  divided = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
  divided?: boolean;
}) {
  return (
    <div className={divided ? "border-l border-line px-6 py-7 sm:px-8" : "px-6 py-7 sm:px-8"}>
      <div className={`num text-3xl leading-none tracking-tight ${accent ? "text-accent" : "text-ink"}`}>
        {value}
      </div>
      <div className="label mt-3">{label}</div>
    </div>
  );
}

function Meta({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="label">{label}</span>
      <span className={strong ? "text-sm text-ink" : "text-sm text-muted"}>{value}</span>
    </span>
  );
}

function RecentActivity({ course }: { course: Awaited<ReturnType<typeof loadCourse>> }) {
  type Entry = { at: string; text: string; detail: string; href: string };
  const entries: Entry[] = [];

  for (const tv of course.topics) {
    for (const a of tv.attempts) {
      entries.push({
        at: a.created_at,
        text: `${tv.topic.title} quiz`,
        detail: a.passed ? "Passed" : `Attempt ${a.attempt_number}, scored ${a.score}`,
        href: `/m/${tv.moduleSlug}/topics/${tv.topic.slug}`,
      });
    }
    if (tv.submission?.graded_at) {
      entries.push({
        at: tv.submission.graded_at,
        text: tv.project?.title ?? "Project",
        detail: `Graded ${tv.submission.total_score}`,
        href: `/m/${tv.moduleSlug}/assignments/${tv.topic.slug}`,
      });
    }
  }

  entries.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const recent = entries.slice(0, 6);

  if (recent.length === 0) {
    return <p className="mt-6 text-muted">Nothing yet. Your first quiz attempt will show up here.</p>;
  }

  return (
    <ul className="mt-2">
      {recent.map((e, i) => (
        <li key={i}>
          <Link
            href={e.href}
            className="flex items-baseline justify-between gap-6 border-b border-line py-3.5 transition-colors duration-150 hover:bg-raised"
          >
            <span className="truncate text-sm text-ink">{e.text}</span>
            <span className="flex shrink-0 items-baseline gap-5">
              <span className="text-sm text-muted">{e.detail}</span>
              <span className="num w-14 text-right text-xs text-faint">
                {formatDate(new Date(e.at))}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

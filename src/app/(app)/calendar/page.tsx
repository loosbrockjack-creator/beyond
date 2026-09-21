import Link from "next/link";
import { Lock } from "lucide-react";
import { loadCourse } from "@/lib/course";
import { Page, PageTitle } from "@/components/primitives/Page";
import { SectionHeader } from "@/components/primitives/Label";
import { weekStart, projectDue, formatDate } from "@/lib/schedule";
import { cn } from "@/lib/cn";

export default async function CalendarPage() {
  const course = await loadCourse();

  return (
    <Page wide>
      <PageTitle
        label="Course"
        title="Calendar"
        lead="Sixteen weeks, one build each. A two week break over the holidays keeps weeks 14 and 15 off Christmas and New Year's Day."
      />

      {course.modules.map((m) => (
        <section key={m.module.id} className="mb-12">
          <SectionHeader>
            {`${String(m.module.number).padStart(2, "0")} · ${m.module.title}`}
          </SectionHeader>

          <ul className="mt-4">
            {m.topics.map((t) => {
              const start = weekStart(course.startDate, t.topic.week_number);
              const due = projectDue(course.startDate, t.topic.week_number);
              const locked = t.status === "locked";
              const isCurrent = t.topic.week_number === course.week;

              const row = (
                <div className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-x-5 py-4">
                  <span className={cn("num text-xs", locked ? "text-faint" : "text-muted")}>
                    {String(t.topic.week_number).padStart(2, "0")}
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    {locked ? (
                      <Lock className="size-3 shrink-0 text-faint" aria-hidden="true" />
                    ) : isCurrent ? (
                      <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-label="Current week" />
                    ) : null}
                    <span className={cn("truncate text-sm", locked ? "text-muted" : "text-ink")}>
                      {t.topic.title}
                    </span>
                  </span>
                  <span className="num shrink-0 text-right text-xs text-muted">
                    {formatDate(start)} <span className="text-faint">to</span> {formatDate(due)}
                  </span>
                </div>
              );

              return (
                <li
                  key={t.topic.id}
                  className={cn("border-b border-line", isCurrent && "bg-raised")}
                >
                  {locked ? (
                    <div className="px-2 opacity-70">{row}</div>
                  ) : (
                    <Link
                      href={`/m/${t.moduleSlug}/topics/${t.topic.slug}`}
                      className="block px-2 transition-colors duration-150 hover:bg-raised"
                    >
                      {row}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Page>
  );
}

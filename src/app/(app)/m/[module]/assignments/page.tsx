import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { loadCourse, findModule } from "@/lib/course";
import { Page, PageTitle } from "@/components/primitives/Page";
import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { formatDate } from "@/lib/schedule";
import { cn } from "@/lib/cn";

export default async function AssignmentsPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: slug } = await params;
  const course = await loadCourse();
  const view = findModule(course, slug);
  if (!view) notFound();

  return (
    <Page wide>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/" },
          { label: view.module.title, href: `/m/${slug}` },
          { label: "Assignments" },
        ]}
      />
      <PageTitle
        label={`Module ${String(view.module.number).padStart(2, "0")}`}
        title="Assignments"
        lead="One build per week. Projects are graded against a rubric but never gate the next topic."
      />

      {view.topics.every((t) => !t.project) ? (
        <p className="mb-10 max-w-[62ch] text-sm text-muted">
          No projects written yet. One build per week gets added as each topic is written.
        </p>
      ) : null}

      <div className="grid grid-cols-[1.5rem_1fr_auto_auto] items-center gap-x-5 border-b border-line pb-2.5">
        <span className="label">Wk</span>
        <span className="label">Project</span>
        <span className="label text-right">Due</span>
        <span className="label w-12 text-right">Score</span>
      </div>

      <ul>
        {view.topics.map((t) => {
          const locked = t.status === "locked";
          const score = t.submission?.total_score;

          const row = (
            <div className="grid grid-cols-[1.5rem_1fr_auto_auto] items-center gap-x-5 py-4">
              <span className={cn("num text-xs", locked ? "text-faint" : "text-muted")}>
                {String(t.topic.week_number).padStart(2, "0")}
              </span>
              <span className="flex min-w-0 items-center gap-2">
                {locked ? <Lock className="size-3 shrink-0 text-faint" aria-hidden="true" /> : null}
                <span className={cn("truncate text-sm", locked ? "text-muted" : "text-ink")}>
                  {t.project?.title ?? "—"}
                </span>
              </span>
              <span
                className={cn(
                  "num text-right text-xs",
                  t.overdue && !locked ? "text-ink" : "text-muted",
                  locked && "text-faint",
                )}
              >
                {t.overdue && !locked ? "Overdue" : formatDate(t.due)}
              </span>
              <span className="num w-12 text-right text-sm">
                {score != null ? (
                  <span className="text-ink">{score}</span>
                ) : (
                  <span className="text-faint">{"—"}</span>
                )}
              </span>
            </div>
          );

          return (
            <li key={t.topic.id} className="border-b border-line">
              {locked || !t.project ? (
                <div className="px-1 opacity-70">{row}</div>
              ) : (
                <Link
                  href={`/m/${slug}/assignments/${t.topic.slug}`}
                  className="block px-1 transition-colors duration-150 hover:bg-raised"
                >
                  {row}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </Page>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { loadCourse, findModule } from "@/lib/course";
import { Page, PageTitle } from "@/components/primitives/Page";
import { SectionHeader } from "@/components/primitives/Label";
import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { weekStart, projectDue, formatDate } from "@/lib/schedule";

export default async function ModuleSyllabusPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: slug } = await params;
  const course = await loadCourse();
  const view = findModule(course, slug);
  if (!view) notFound();

  const first = weekStart(course.startDate, view.topics[0].topic.week_number);
  const last = projectDue(
    course.startDate,
    view.topics[view.topics.length - 1].topic.week_number,
  );

  return (
    <Page>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/" },
          { label: view.module.title, href: `/m/${slug}` },
          { label: "Syllabus" },
        ]}
      />
      <PageTitle
        label={`Module ${String(view.module.number).padStart(2, "0")}`}
        title={view.module.title}
        lead={view.module.summary}
      />

      <p className="mb-14 text-sm text-muted">
        {formatDate(first)} <span className="text-faint">to</span> {formatDate(last)}
      </p>

      <SectionHeader>Topics</SectionHeader>
      <div className="mt-6 flex flex-col gap-10">
        {view.topics.map((t) => (
          <article key={t.topic.id}>
            <div className="flex items-baseline gap-3">
              <span className="num text-xs text-accent">
                {String(t.topic.number).padStart(2, "0")}
              </span>
              <h2 className="text-lg font-medium text-ink">
                <Link
                  href={`/m/${slug}/topics/${t.topic.slug}`}
                  className="transition-colors duration-150 hover:text-accent"
                >
                  {t.topic.title}
                </Link>
              </h2>
            </div>
            <p className="mt-2 max-w-[64ch] text-sm text-muted">{t.topic.summary}</p>
            {t.project ? (
              <p className="mt-3 text-xs text-muted">
                <span className="label inline">Build</span>{" "}
                <span className="ml-2">{t.project.title}</span>
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </Page>
  );
}

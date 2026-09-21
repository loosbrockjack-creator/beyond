import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { loadCourse, findModule } from "@/lib/course";
import { Page } from "@/components/primitives/Page";
import { SectionHeader } from "@/components/primitives/Label";
import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { TopicRow } from "@/components/TopicRow";
import { LockedNotice } from "@/components/primitives/Status";
import { formatGpa } from "@/lib/gpa";
import { relativeDue, formatDate } from "@/lib/schedule";

export default async function ModuleHome({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params;
  const course = await loadCourse();
  const view = findModule(course, slug);
  if (!view) notFound();

  const { module, topics, completeCount, locked, gpa } = view;
  const next = topics.find((t) => t.status === "in_progress" || t.status === "available");

  return (
    <Page>
      <Breadcrumb
        items={[{ label: "Dashboard", href: "/" }, { label: module.title }]}
      />

      <header className="mb-12">
        <span className="num label !tracking-[0.3em] text-accent">
          {String(module.number).padStart(2, "0")}
        </span>
        <h1 className="mt-3 text-3xl font-medium tracking-[-0.025em] text-ink">{module.title}</h1>
        <p className="mt-4 max-w-[62ch] text-muted">{module.summary}</p>
      </header>

      {locked ? (
        <LockedNotice>
          This module unlocks when every topic in the previous module is complete.
        </LockedNotice>
      ) : null}

      <div className="mb-14 grid grid-cols-2 border-y border-line">
        <div className="px-6 py-6">
          <div className="num text-2xl leading-none text-ink">
            {completeCount}/{topics.length}
          </div>
          <div className="label mt-2.5">Topics complete</div>
        </div>
        <div className="border-l border-line px-6 py-6">
          <div className="num text-2xl leading-none text-ink">{formatGpa(gpa)}</div>
          <div className="label mt-2.5">Module GPA</div>
        </div>
      </div>

      {next && !locked ? (
        <section className="mb-14">
          <SectionHeader>Up next</SectionHeader>
          <Link
            href={`/m/${slug}/topics/${next.topic.slug}`}
            className="group mt-5 block"
          >
            <div className="flex items-baseline gap-3">
              <span className="num text-xs text-accent">
                {String(next.topic.number).padStart(2, "0")}
              </span>
              <h2 className="text-xl font-medium tracking-[-0.02em] text-ink">
                {next.topic.title}
              </h2>
              <ArrowRight className="size-4 text-faint transition-all duration-150 ease-out-quart group-hover:translate-x-1 group-hover:text-ink" />
            </div>
            <p className="mt-2 text-sm text-muted">
              Project due {next.overdue ? `${formatDate(next.due)}, overdue` : relativeDue(next.due)}
            </p>
          </Link>
        </section>
      ) : null}

      <section>
        <SectionHeader right={`${topics.length} topics`}>Topics</SectionHeader>
        <ul className="mt-2">
          {topics.map((t) => (
            <TopicRow key={t.topic.id} view={t} />
          ))}
        </ul>
      </section>
    </Page>
  );
}

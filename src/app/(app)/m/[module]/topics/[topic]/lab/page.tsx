import Link from "next/link";
import { notFound } from "next/navigation";
import { loadCourse, findModule, findTopic } from "@/lib/course";
import { Page } from "@/components/primitives/Page";
import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { DecisionLab } from "@/components/lab/DecisionLab";
import { labForTopic } from "@/lib/labs";

export default async function LabPage({
  params,
}: {
  params: Promise<{ module: string; topic: string }>;
}) {
  const { module: moduleSlug, topic: topicSlug } = await params;
  const course = await loadCourse();
  const moduleView = findModule(course, moduleSlug);
  const view = findTopic(course, topicSlug);
  if (!moduleView || !view) notFound();

  const lab = labForTopic(topicSlug);
  if (!lab) notFound();

  const topicHref = `/m/${moduleSlug}/topics/${topicSlug}`;

  return (
    <Page>
      <Breadcrumb
        items={[
          { label: moduleView.module.title, href: `/m/${moduleSlug}` },
          { label: view.topic.title, href: topicHref },
          { label: "Lab" },
        ]}
      />

      <header className="mb-12">
        <span className="num label !tracking-[0.3em] text-accent">
          Week {String(view.topic.week_number).padStart(2, "0")} · Lab
        </span>
        <h1 className="mt-3 text-2xl font-medium tracking-[-0.025em] text-ink">{lab.title}</h1>
        <p className="mt-4 max-w-[64ch] text-muted">{lab.lead}</p>
      </header>

      <DecisionLab lab={lab} />

      <p className="mt-14 text-xs text-muted">
        <Link href={topicHref} className="transition-colors hover:text-ink">
          Back to week {String(view.topic.week_number).padStart(2, "0")}
        </Link>
      </p>
    </Page>
  );
}

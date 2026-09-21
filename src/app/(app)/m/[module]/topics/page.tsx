import { notFound } from "next/navigation";
import { loadCourse, findModule } from "@/lib/course";
import { Page, PageTitle } from "@/components/primitives/Page";
import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { TopicRow } from "@/components/TopicRow";

export default async function TopicsPage({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params;
  const course = await loadCourse();
  const view = findModule(course, slug);
  if (!view) notFound();

  return (
    <Page>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/" },
          { label: view.module.title, href: `/m/${slug}` },
          { label: "Topics" },
        ]}
      />
      <PageTitle
        label={`Module ${String(view.module.number).padStart(2, "0")}`}
        title="Topics"
        lead="Each topic unlocks when the one before it has been passed at 100 percent."
      />
      <ul>
        {view.topics.map((t) => (
          <TopicRow key={t.topic.id} view={t} />
        ))}
      </ul>
    </Page>
  );
}

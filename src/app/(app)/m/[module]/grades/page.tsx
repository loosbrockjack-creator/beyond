import { notFound } from "next/navigation";
import { loadCourse, findModule } from "@/lib/course";
import { Page, PageTitle } from "@/components/primitives/Page";
import { GradeTable } from "@/components/grades/GradeTable";
import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { formatGpa } from "@/lib/gpa";

export default async function ModuleGradesPage({
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
          { label: "Grades" },
        ]}
      />
      <PageTitle label={`Module ${String(view.module.number).padStart(2, "0")}`} title="Grades" />

      <div className="mb-12 grid grid-cols-2 border-y border-line">
        <div className="px-5 py-6">
          <div className="num text-2xl leading-none text-accent">{formatGpa(view.gpa)}</div>
          <div className="label mt-3">Module GPA</div>
        </div>
        <div className="border-l border-line px-5 py-6">
          <div className="num text-2xl leading-none text-ink">
            {view.completeCount}/{view.topics.length}
          </div>
          <div className="label mt-3">Topics passed</div>
        </div>
      </div>

      <GradeTable topics={view.topics} />
    </Page>
  );
}

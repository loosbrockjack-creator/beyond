import { notFound } from "next/navigation";
import { loadCourse, findModule } from "@/lib/course";
import { ModuleSidebar } from "@/components/nav/ModuleSidebar";

export default async function ModuleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ module: string }>;
}) {
  const { module: slug } = await params;
  const course = await loadCourse();
  const view = findModule(course, slug);
  if (!view) notFound();

  return (
    <div className="flex min-h-dvh">
      <ModuleSidebar
        slug={view.module.slug}
        number={view.module.number}
        title={view.module.title}
        subtitle={view.module.subtitle}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

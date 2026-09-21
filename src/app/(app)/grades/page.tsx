import { loadCourse } from "@/lib/course";
import { Page, PageTitle } from "@/components/primitives/Page";
import { SectionHeader } from "@/components/primitives/Label";
import { GradeTable } from "@/components/grades/GradeTable";
import { formatGpa } from "@/lib/gpa";

export default async function GradesPage() {
  const course = await loadCourse();
  const gradedCount = course.topics.filter((t) => t.submission?.total_score != null).length;

  return (
    <Page wide>
      <PageTitle
        label="Course"
        title="Grades"
        lead="The GPA comes from graded projects only. Quizzes are pass or fail gates and never move the number."
      />

      <div className="mb-14 grid grid-cols-3 border-y border-line">
        <div className="px-5 py-6 sm:px-7">
          <div className="num text-3xl leading-none text-accent">{formatGpa(course.gpa)}</div>
          <div className="label mt-3">Course GPA</div>
        </div>
        <div className="border-l border-line px-5 py-6 sm:px-7">
          <div className="num text-3xl leading-none text-ink">{gradedCount}</div>
          <div className="label mt-3">Projects graded</div>
        </div>
        <div className="border-l border-line px-5 py-6 sm:px-7">
          <div className="num text-3xl leading-none text-ink">{course.completeCount}</div>
          <div className="label mt-3">Topics passed</div>
        </div>
      </div>

      {course.modules.map((m) => (
        <section key={m.module.id} className="mb-12">
          <SectionHeader right={m.gpa !== null ? `${formatGpa(m.gpa)} GPA` : undefined}>
            {`${String(m.module.number).padStart(2, "0")} · ${m.module.title}`}
          </SectionHeader>
          <div className="mt-4">
            <GradeTable topics={m.topics} />
          </div>
        </section>
      ))}
    </Page>
  );
}

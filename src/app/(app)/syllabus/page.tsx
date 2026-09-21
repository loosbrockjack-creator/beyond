import Link from "next/link";
import { loadCourse } from "@/lib/course";
import { Page, PageTitle } from "@/components/primitives/Page";
import { SectionHeader } from "@/components/primitives/Label";
import { weekStart, projectDue, formatDate, WEEKS_TOTAL } from "@/lib/schedule";

const POLICIES = [
  {
    label: "Unlocking",
    body: "Each topic's quiz must be passed at 100% before the next topic opens. Retakes are unlimited and every attempt is recorded, including the ones you failed. A module opens once every topic in the module before it is complete.",
  },
  {
    label: "Grading",
    body: "The GPA comes from graded projects only, on the standard 4.0 scale. Quizzes are pass or fail gates: since a pass is always 100, they carry no information a GPA could use.",
  },
  {
    label: "Projects",
    body: "One build per week, due Friday at 11:59pm. Each is scored out of 100 against a five-part rubric by an AI grader, which returns per-criterion scores and written feedback. Projects are graded but never gate the next topic.",
  },
  {
    label: "Pace",
    body: "Sixteen weeks, sixteen topics, sixteen builds. Weeks 1 to 13 run straight through; a two week break then pushes the last three weeks past the holidays.",
  },
];

export default async function SyllabusPage() {
  const course = await loadCourse();
  const first = weekStart(course.startDate, 1);
  const last = projectDue(course.startDate, WEEKS_TOTAL);

  return (
    <Page>
      <PageTitle
        label="Course"
        title="Syllabus"
        lead="A self-directed course on building with AI, run like a real one: modules, gated topics, weekly builds and a GPA that is allowed to go down."
      />

      <div className="mb-14 grid grid-cols-2 border-y border-line sm:grid-cols-4">
        <Cell value={String(WEEKS_TOTAL)} label="Weeks" />
        <Cell value="16" label="Topics" divided />
        <Cell value="16" label="Builds" divided />
        <Cell value="100%" label="To pass" divided />
      </div>

      <p className="mb-14 text-sm text-muted">
        {formatDate(first)} <span className="text-faint">to</span> {formatDate(last)}
      </p>

      <section className="mb-16">
        <SectionHeader>How it works</SectionHeader>
        <dl className="mt-6 flex flex-col gap-8">
          {POLICIES.map((p) => (
            <div key={p.label}>
              <dt className="label">{p.label}</dt>
              <dd className="mt-2.5 max-w-[66ch] leading-relaxed text-ink">{p.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <SectionHeader>Outline</SectionHeader>
        <div className="mt-6 flex flex-col gap-10">
          {course.modules.map((m) => (
            <div key={m.module.id}>
              <div className="flex items-baseline gap-3">
                <span className="num text-xs text-accent">
                  {String(m.module.number).padStart(2, "0")}
                </span>
                <h2 className="text-lg font-medium text-ink">{m.module.title}</h2>
              </div>
              <p className="mt-2 max-w-[62ch] text-sm text-muted">{m.module.summary}</p>

              <ul className="mt-4">
                {m.topics.map((t) => (
                  <li key={t.topic.id} className="border-b border-line">
                    <Link
                      href={`/m/${t.moduleSlug}/topics/${t.topic.slug}`}
                      className="flex items-baseline gap-4 py-3 transition-colors duration-150 hover:bg-raised"
                    >
                      <span className="num w-6 text-xs text-muted">
                        {String(t.topic.number).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-ink">{t.topic.title}</span>
                        <span className="mt-0.5 block text-xs text-muted">{t.topic.summary}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </Page>
  );
}

function Cell({ value, label, divided = false }: { value: string; label: string; divided?: boolean }) {
  return (
    <div className={divided ? "border-l border-line px-5 py-6" : "px-5 py-6"}>
      <div className="num text-2xl leading-none text-ink">{value}</div>
      <div className="label mt-2.5">{label}</div>
    </div>
  );
}

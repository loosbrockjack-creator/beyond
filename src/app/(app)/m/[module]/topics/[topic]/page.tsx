import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { loadCourse, findModule, findTopic } from "@/lib/course";
import { createClient } from "@/lib/supabase/server";
import { Page } from "@/components/primitives/Page";
import { SectionHeader } from "@/components/primitives/Label";
import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { LockedNotice } from "@/components/primitives/Status";
import { Button } from "@/components/primitives/Button";
import { AttemptHistory } from "@/components/quiz/AttemptHistory";
import { formatDate, formatDateTime, relativeDue } from "@/lib/schedule";
import { SessionList } from "@/components/SessionList";
import { GenerateBrief } from "@/components/GenerateBrief";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ module: string; topic: string }>;
}) {
  const { module: moduleSlug, topic: topicSlug } = await params;
  const course = await loadCourse();
  const moduleView = findModule(course, moduleSlug);
  const view = findTopic(course, topicSlug);
  if (!moduleView || !view) notFound();

  const locked = view.status === "locked";
  const passed = view.status === "complete";
  const prev = course.topics.find((t) => t.topic.number === view.topic.number - 1);

  const supabase = await createClient();
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("topic_id", view.topic.id)
    .order("created_at", { ascending: false });

  return (
    <Page>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/" },
          { label: moduleView.module.title, href: `/m/${moduleSlug}` },
          { label: "Topics", href: `/m/${moduleSlug}/topics` },
          { label: `Topic ${String(view.topic.number).padStart(2, "0")}` },
        ]}
      />

      <header className="mb-12">
        <span className="num label !tracking-[0.3em] text-accent">
          Topic {String(view.topic.number).padStart(2, "0")} · Week{" "}
          {String(view.topic.week_number).padStart(2, "0")}
        </span>
        <h1 className="mt-3 text-3xl font-medium tracking-[-0.025em] text-ink">
          {view.topic.title}
        </h1>
        <p className="mt-4 max-w-[64ch] text-muted">{view.topic.summary}</p>
      </header>

      {locked ? (
        <div className="mb-12">
          <LockedNotice>
            {prev
              ? `Pass the ${prev.topic.title} quiz at 100% to unlock this topic.`
              : "This topic is locked."}
          </LockedNotice>
        </div>
      ) : null}

      {view.topic.why_it_matters ? (
        <section className="mb-14 border-y border-line py-8">
          <span className="label">Why it matters</span>
          <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-ink">
            {view.topic.why_it_matters}
          </p>
        </section>
      ) : null}

      <section className="mb-14">
        <SectionHeader
          right={
            view.sessions.length > 0
              ? `${view.sessionsDone} of ${view.sessions.length} done`
              : undefined
          }
        >
          Sessions
        </SectionHeader>

        <div className="mt-4">
          {view.sessions.length > 0 ? (
            <>
              <SessionList
                sessions={view.sessions}
                basePath={`/m/${moduleSlug}/topics/${topicSlug}`}
              />
              <p className="mt-4 text-xs text-muted">
                Do these in any order, whenever you want. Sessions have no deadline.
              </p>
            </>
          ) : (
            <p className="max-w-[62ch] text-sm text-muted">
              No sessions written for this week yet. Each one is a single thing to read
              followed by a three question recall.
            </p>
          )}
        </div>
      </section>

      <section className="mb-14">
        <SectionHeader
          right={!view.quiz ? undefined : passed ? "Passed" : `${view.attempts.length} attempts`}
        >
          Weekly quiz
        </SectionHeader>

        <div className="mt-6">
          {!view.quiz ? (
            <p className="max-w-[62ch] text-sm text-muted">
              No quiz written yet. Passing one at 100% is what unlocks the next topic, so
              this topic stays open until there is something to pass.
            </p>
          ) : (
            <>
              <AttemptHistory attempts={view.attempts} />

              {!locked && !view.quizReady ? (
                <p className="mt-6 max-w-[62ch] text-sm text-muted">
                  Opens once all {view.sessions.length} sessions are done. The quiz is drawn
                  from them, weighted toward whatever you recalled worst.
                </p>
              ) : null}

              {!locked && view.quizReady ? (
                <div className="mt-6">
                  <Link href={`/m/${moduleSlug}/topics/${topicSlug}/quiz`}>
                    <Button variant={passed ? "secondary" : "primary"}>
                      {passed ? "Retake quiz" : view.attempts.length > 0 ? "Try again" : "Take quiz"}
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>
                  {!passed ? (
                    <p className="mt-3 text-xs text-muted">
                      100% unlocks the next topic. Unlimited retakes. Due{" "}
                      {formatDateTime(view.quizDue)}
                      {view.quizOverdue ? ", overdue" : ""}.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      {view.project ? (
        <section className="mb-14">
          <SectionHeader
            right={
              view.submission?.total_score != null
                ? `Graded ${view.submission.total_score}`
                : view.overdue
                  ? "Overdue"
                  : `Due ${relativeDue(view.due)}`
            }
          >
            Project
          </SectionHeader>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-ink">{view.project.title}</h3>
            <p className="mt-2 max-w-[62ch] text-sm text-muted">{view.project.brief}</p>
            {view.project.hard_constraint ? (
              <p className="mt-4 max-w-[62ch] border-l border-line-strong pl-4 text-sm text-ink">
                {view.project.hard_constraint}
              </p>
            ) : null}
            <p className="mt-4 text-xs text-muted">
              Due {formatDateTime(view.due)}
              {view.project.est_hours ? ` \u00b7 about ${view.project.est_hours} hours` : ""}
            </p>

            {!locked ? (
              <div className="mt-6">
                <Link href={`/m/${moduleSlug}/assignments/${topicSlug}`}>
                  <Button variant="secondary">
                    {view.submission ? "View submission" : "Open project"}
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="mb-14">
          <SectionHeader>Project</SectionHeader>
          {view.sessions.length === 0 ? (
            <p className="mt-6 max-w-[62ch] text-sm text-muted">
              No project yet. Sessions have to exist first, since the brief is written
              from them.
            </p>
          ) : (
            <>
              <p className="mt-6 mb-6 max-w-[62ch] text-sm text-muted">
                No project yet. One gets written from this week&apos;s {view.sessions.length}{" "}
                sources, aimed at whatever you recalled worst, then frozen so you can build
                against it all week.
              </p>
              <GenerateBrief topicId={view.topic.id} />
            </>
          )}
        </section>
      )}

      <section>
        <SectionHeader right={`${resources?.length ?? 0} saved`}>Resources</SectionHeader>
        {resources && resources.length > 0 ? (
          <ul className="mt-2">
            {resources.map((r) => (
              <li key={r.id} className="border-b border-line">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start justify-between gap-6 py-3.5 transition-colors duration-150 hover:bg-raised"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ink">{r.title}</span>
                    {r.note ? <span className="mt-0.5 block text-xs text-muted">{r.note}</span> : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="label">{r.kind}</span>
                    <ExternalLink className="size-3.5 text-faint" aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-muted">
            Nothing saved yet. Links you collect while researching this topic land here.
          </p>
        )}
      </section>
    </Page>
  );
}

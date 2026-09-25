import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Check } from "lucide-react";
import { loadCourse, findModule, findTopic } from "@/lib/course";
import { createClient } from "@/lib/supabase/server";
import { markSessionOpened } from "@/lib/actions/session";
import { Page } from "@/components/primitives/Page";
import { SectionHeader } from "@/components/primitives/Label";
import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { RecallRunner, type RecallQ } from "@/components/session/RecallRunner";
import { MarkRead } from "@/components/session/MarkRead";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ module: string; topic: string; n: string }>;
}) {
  const { module: moduleSlug, topic: topicSlug, n } = await params;
  const order = Number(n);
  if (!Number.isInteger(order)) notFound();

  const course = await loadCourse();
  const moduleView = findModule(course, moduleSlug);
  const view = findTopic(course, topicSlug);
  if (!moduleView || !view) notFound();

  const sv = view.sessions.find((s) => s.session.order_index === order);
  if (!sv) notFound();

  const session = sv.session;
  const topicHref = `/m/${moduleSlug}/topics/${topicSlug}`;
  const nextSession = view.sessions.find((s) => s.session.order_index === order + 1);
  const nextHref = nextSession
    ? `${topicHref}/sessions/${nextSession.session.order_index}`
    : null;

  await markSessionOpened(session.id);

  const supabase = await createClient();
  // No is_correct here: recalls are graded server side only.
  const { data } = await supabase
    .from("recall_questions")
    .select("id, prompt, order_index, carried_from_session_id, recall_options(id, label, order_index)")
    .eq("session_id", session.id)
    .order("order_index");

  const questions: RecallQ[] = (data ?? []).map((q) => ({
    id: q.id,
    prompt: q.prompt,
    carried: q.carried_from_session_id != null,
    options: [...q.recall_options]
      .sort((a, b) => a.order_index - b.order_index)
      .map((o) => ({ id: o.id, label: o.label })),
  }));

  return (
    <Page>
      <Breadcrumb
        items={[
          { label: moduleView.module.title, href: `/m/${moduleSlug}` },
          { label: view.topic.title, href: topicHref },
          { label: `Session ${String(order).padStart(2, "0")}` },
        ]}
      />

      <header className="mb-10">
        <span className="num label !tracking-[0.3em] text-accent">
          Week {String(view.topic.week_number).padStart(2, "0")} · Session{" "}
          {String(order).padStart(2, "0")} of {String(view.sessions.length).padStart(2, "0")}
        </span>
        <h1 className="mt-3 text-2xl font-medium tracking-[-0.025em] text-ink">
          {session.title}
        </h1>
        {session.note ? (
          <p className="mt-4 max-w-[64ch] text-muted">{session.note}</p>
        ) : null}
      </header>

      {session.source_url ? (
        <a
          href={session.source_url}
          target="_blank"
          rel="noreferrer"
          className="group mb-14 flex items-center justify-between gap-4 border border-line bg-surface px-5 py-4 transition-colors duration-150 hover:border-line-strong hover:bg-raised"
        >
          <span className="min-w-0">
            <span className="label block">Read this first</span>
            <span className="mt-1.5 block truncate text-sm text-ink">{session.source_url}</span>
          </span>
          <ExternalLink className="size-4 shrink-0 text-faint transition-colors duration-150 group-hover:text-ink" />
        </a>
      ) : null}

      {sv.done ? (
        <p className="mb-10 flex items-center gap-2 text-sm text-muted">
          <Check className="size-3.5 text-accent" aria-hidden="true" />
          Done
          {sv.progress?.total_count
            ? `, recalled ${sv.progress.correct_count} of ${sv.progress.total_count}`
            : ""}
          .
        </p>
      ) : null}

      <section>
        <SectionHeader right={questions.length > 0 ? `${questions.length} questions` : undefined}>
          Active recall
        </SectionHeader>

        <div className="mt-8">
          {questions.length > 0 ? (
            <RecallRunner
              sessionId={session.id}
              questions={questions}
              nextHref={nextHref}
              topicHref={topicHref}
            />
          ) : (
            <div>
              <p className="max-w-[62ch] text-sm text-muted">
                No recall written for this session yet.
              </p>
              <div className="mt-6">
                <MarkRead sessionId={session.id} nextHref={nextHref ?? topicHref} />
              </div>
            </div>
          )}
        </div>
      </section>

      <p className="mt-14 text-xs text-muted">
        <Link href={topicHref} className="transition-colors hover:text-ink">
          Back to week {String(view.topic.week_number).padStart(2, "0")}
        </Link>
      </p>
    </Page>
  );
}

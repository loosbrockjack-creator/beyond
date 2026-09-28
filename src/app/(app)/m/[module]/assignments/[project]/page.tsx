import { notFound, redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { loadCourse, findModule, findTopic } from "@/lib/course";
import { createClient } from "@/lib/supabase/server";
import { Page } from "@/components/primitives/Page";
import { SectionHeader } from "@/components/primitives/Label";
import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { RubricBreakdown, type RubricRow } from "@/components/grades/RubricBreakdown";
import { SubmitForm } from "@/components/SubmitForm";
import { GenerateBrief } from "@/components/GenerateBrief";
import { formatDateTime, relativeDue, formatDate } from "@/lib/schedule";
import { gradeFor } from "@/lib/gpa";

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ module: string; project: string }>;
}) {
  const { module: moduleSlug, project: topicSlug } = await params;
  const course = await loadCourse();
  const moduleView = findModule(course, moduleSlug);
  const view = findTopic(course, topicSlug);
  if (!moduleView || !view || !view.project) notFound();

  if (view.status === "locked") {
    redirect(`/m/${moduleSlug}/topics/${topicSlug}`);
  }

  const supabase = await createClient();
  const { data: criteria } = await supabase
    .from("rubric_criteria")
    .select("id, label, description, max_points")
    .eq("project_id", view.project.id)
    .order("order_index");

  const { data: scores } = view.submission
    ? await supabase
        .from("rubric_scores")
        .select("criterion_id, points, comment")
        .eq("submission_id", view.submission.id)
    : { data: null };

  const scoreByCriterion = new Map((scores ?? []).map((s) => [s.criterion_id, s]));

  const rows: RubricRow[] = (criteria ?? []).map((c) => {
    const s = scoreByCriterion.get(c.id);
    return {
      id: c.id,
      label: c.label,
      description: c.description,
      maxPoints: c.max_points,
      points: s?.points ?? null,
      comment: s?.comment ?? null,
    };
  });

  const submission = view.submission;
  const graded = submission?.status === "graded" && submission.total_score != null;
  const grade = graded ? gradeFor(submission.total_score!) : null;

  return (
    <Page>
      <Breadcrumb
        items={[
          { label: moduleView.module.title, href: `/m/${moduleSlug}` },
          { label: "Assignments", href: `/m/${moduleSlug}/assignments` },
          { label: `Week ${String(view.topic.week_number).padStart(2, "0")}` },
        ]}
      />

      <header className="mb-10">
        <span className="num label !tracking-[0.3em] text-accent">
          Week {String(view.topic.week_number).padStart(2, "0")} · {view.topic.title}
        </span>
        <h1 className="mt-3 text-3xl font-medium tracking-[-0.025em] text-ink">
          {view.project.title}
        </h1>
        <p className="mt-4 max-w-[64ch] whitespace-pre-line text-muted">{view.project.brief}</p>

        {view.project.hard_constraint ? (
          <div className="mt-8 border-y border-line py-6">
            <span className="label">The constraint that matters</span>
            <p className="mt-3 max-w-[64ch] leading-relaxed text-ink">
              {view.project.hard_constraint}
            </p>
          </div>
        ) : null}

        {view.project.spine_note ? (
          <p className="mt-6 max-w-[64ch] text-sm text-muted">
            <span className="label inline">Fits in</span>{" "}
            <span className="ml-2">{view.project.spine_note}</span>
          </p>
        ) : null}
      </header>

      <div className="mb-14 grid grid-cols-2 border-y border-line sm:grid-cols-4">
        <div className="px-5 py-5">
          <div className="num text-sm text-ink">{formatDate(view.due)}</div>
          <div className="label mt-2">Due</div>
        </div>
        <div className="border-l border-line px-5 py-5">
          <div className="text-sm text-ink">
            {graded ? "Graded" : submission ? "Submitted" : view.overdue ? "Overdue" : relativeDue(view.due)}
          </div>
          <div className="label mt-2">Status</div>
        </div>
        <div className="border-l border-line px-5 py-5">
          <div className="num text-sm text-ink">
            {view.project.est_hours ? `${view.project.est_hours} hrs` : "\u2014"}
          </div>
          <div className="label mt-2">Budget</div>
        </div>
        <div className="col-span-2 border-t border-line px-5 py-5 sm:col-span-1 sm:border-t-0 sm:border-l">
          <div className="num text-sm">
            {graded ? (
              <>
                <span className="text-accent">{submission!.total_score}</span>
                <span className="ml-2 text-ink">{grade!.letter}</span>
              </>
            ) : (
              <span className="text-faint">{"—"}</span>
            )}
          </div>
          <div className="label mt-2">Score</div>
        </div>
      </div>

      {submission?.feedback ? (
        <section className="mb-14">
          <SectionHeader right={submission.graded_at ? formatDate(new Date(submission.graded_at)) : undefined}>
            Feedback
          </SectionHeader>
          <p className="mt-5 max-w-[66ch] leading-relaxed text-ink">{submission.feedback}</p>
          {submission.repo_url ? (
            <a
              href={submission.repo_url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
            >
              {submission.repo_url}
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </section>
      ) : null}

      <section className="mb-14">
        <SectionHeader right="100 points">Rubric</SectionHeader>
        <div className="mt-4">
          <RubricBreakdown rows={rows} total={submission?.total_score ?? null} />
        </div>
      </section>

      <section className="mb-14">
        <SectionHeader>{submission ? "Resubmit" : "Submit"}</SectionHeader>
        <p className="mt-5 mb-6 text-sm text-muted">Due {formatDateTime(view.due)}.</p>
        <SubmitForm
          projectId={view.project.id}
          submissionId={submission?.id ?? null}
          initialRepoUrl={submission?.repo_url ?? ""}
          initialNotes={submission?.notes ?? ""}
        />
      </section>

      <section>
        <SectionHeader>Brief</SectionHeader>
        <p className="mt-5 mb-5 max-w-[62ch] text-xs text-muted">
          Written from this week&apos;s sources and frozen. Regenerating replaces it and the
          rubric, so avoid it once you have started building.
        </p>
        <GenerateBrief topicId={view.topic.id} regenerate />
      </section>
    </Page>
  );
}

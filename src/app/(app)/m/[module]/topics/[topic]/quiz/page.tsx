import { notFound, redirect } from "next/navigation";
import { loadCourse, findModule, findTopic } from "@/lib/course";
import { createClient } from "@/lib/supabase/server";
import { Page } from "@/components/primitives/Page";
import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { QuizRunner, type RunnerQuestion } from "@/components/quiz/QuizRunner";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ module: string; topic: string }>;
}) {
  const { module: moduleSlug, topic: topicSlug } = await params;
  const course = await loadCourse();
  const moduleView = findModule(course, moduleSlug);
  const view = findTopic(course, topicSlug);
  if (!moduleView || !view || !view.quiz) notFound();

  // The gate is enforced here, not just hidden in the UI.
  if (view.status === "locked") {
    redirect(`/m/${moduleSlug}/topics/${topicSlug}`);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_questions")
    .select("id, prompt, order_index, quiz_options(id, label, order_index)")
    .eq("quiz_id", view.quiz.id)
    .order("order_index");

  // Note the absence of is_correct: answers are graded server side only.
  const questions: RunnerQuestion[] = (data ?? []).map((q) => ({
    id: q.id,
    prompt: q.prompt,
    options: [...q.quiz_options]
      .sort((a, b) => a.order_index - b.order_index)
      .map((o) => ({ id: o.id, label: o.label })),
  }));

  const topicHref = `/m/${moduleSlug}/topics/${topicSlug}`;

  return (
    <Page>
      <Breadcrumb
        items={[
          { label: moduleView.module.title, href: `/m/${moduleSlug}` },
          { label: view.topic.title, href: topicHref },
          { label: "Quiz" },
        ]}
      />
      <QuizRunner
        quizId={view.quiz.id}
        questions={questions}
        topicTitle={view.topic.title}
        topicHref={topicHref}
        passThreshold={view.quiz.pass_threshold}
      />
    </Page>
  );
}

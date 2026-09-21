"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { scoreQuiz } from "@/lib/gating";

export interface AttemptResult {
  score: number;
  passed: boolean;
  attemptNumber: number;
  /** questionId -> correct optionId, for rendering the review */
  correct: Record<string, string>;
  explanations: Record<string, string | null>;
}

/**
 * Scores an attempt on the server. The client never receives `is_correct`
 * before submitting, and the score it reports is never trusted.
 */
export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, string>,
): Promise<AttemptResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("id, topic_id, pass_threshold")
    .eq("id", quizId)
    .single();
  if (quizError || !quiz) throw new Error("Quiz not found");

  const { data: questions, error: qError } = await supabase
    .from("quiz_questions")
    .select("id, explanation, quiz_options(id, is_correct)")
    .eq("quiz_id", quizId)
    .order("order_index");
  if (qError || !questions) throw new Error("Could not load questions");

  const correct: Record<string, string> = {};
  const explanations: Record<string, string | null> = {};
  for (const q of questions) {
    const right = q.quiz_options.find((o) => o.is_correct);
    if (right) correct[q.id] = right.id;
    explanations[q.id] = q.explanation;
  }

  const score = scoreQuiz(answers, correct);
  const passed = score >= quiz.pass_threshold;

  const { count } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact", head: true })
    .eq("quiz_id", quizId)
    .eq("user_id", user.id);

  const attemptNumber = (count ?? 0) + 1;

  const { error: insertError } = await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    quiz_id: quizId,
    attempt_number: attemptNumber,
    score,
    passed,
    answers,
  });
  if (insertError) throw new Error(insertError.message);

  // Bookkeeping only. loadCourse always derives status from attempts, so this
  // row can never drift into being the thing that decides what is unlocked.
  const now = new Date().toISOString();
  await supabase.from("topic_progress").upsert({
    user_id: user.id,
    topic_id: quiz.topic_id,
    status: passed ? "complete" : "in_progress",
    completed_at: passed ? now : null,
  });

  if (passed) {
    const { data: current } = await supabase
      .from("topics")
      .select("number")
      .eq("id", quiz.topic_id)
      .single();

    if (current) {
      const { data: next } = await supabase
        .from("topics")
        .select("id")
        .eq("number", current.number + 1)
        .maybeSingle();

      if (next) {
        await supabase.from("topic_progress").upsert({
          user_id: user.id,
          topic_id: next.id,
          status: "available",
          unlocked_at: now,
        });
      }
    }
  }

  revalidatePath("/", "layout");
  return { score, passed, attemptNumber, correct, explanations };
}

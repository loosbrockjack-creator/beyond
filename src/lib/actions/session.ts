"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface RecallResult {
  correctCount: number;
  totalCount: number;
  score: number;
  /** questionId -> correct optionId */
  correct: Record<string, string>;
  explanations: Record<string, string | null>;
}

/**
 * Scores a session recall on the server and records it. Deliberately ungated:
 * the session is marked complete whatever the score, so one bad evening never
 * blocks the week. The weekly quiz is the only gate.
 */
export async function submitRecall(
  sessionId: string,
  answers: Record<string, string>,
): Promise<RecallResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: questions, error } = await supabase
    .from("recall_questions")
    .select("id, explanation, recall_options(id, is_correct)")
    .eq("session_id", sessionId)
    .order("order_index");
  if (error) throw new Error(error.message);

  const correct: Record<string, string> = {};
  const explanations: Record<string, string | null> = {};
  for (const q of questions ?? []) {
    const right = q.recall_options.find((o) => o.is_correct);
    if (right) correct[q.id] = right.id;
    explanations[q.id] = q.explanation;
  }

  const ids = Object.keys(correct);
  const correctCount = ids.filter((qid) => answers[qid] === correct[qid]).length;
  const totalCount = ids.length;
  const score = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);

  const { error: upsertError } = await supabase.from("session_progress").upsert({
    user_id: user.id,
    session_id: sessionId,
    completed_at: new Date().toISOString(),
    score,
    correct_count: correctCount,
    total_count: totalCount,
    answers,
  });
  if (upsertError) throw new Error(upsertError.message);

  revalidatePath("/", "layout");
  return { correctCount, totalCount, score, correct, explanations };
}

/** For a session that has no recall written yet. */
export async function markSessionRead(sessionId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  await supabase.from("session_progress").upsert({
    user_id: user.id,
    session_id: sessionId,
    completed_at: new Date().toISOString(),
  });

  revalidatePath("/", "layout");
}

export async function markSessionOpened(sessionId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("session_progress")
    .select("opened_at")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing?.opened_at) return;

  await supabase.from("session_progress").upsert({
    user_id: user.id,
    session_id: sessionId,
    opened_at: new Date().toISOString(),
  });
}

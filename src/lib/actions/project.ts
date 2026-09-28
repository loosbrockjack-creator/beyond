"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { gradeSubmission } from "@/lib/grade-submission";
import { generateBrief } from "@/lib/brief";

/** Weekly project budget. Deliberately small so it survives sixteen weeks. */
const BUDGET_HOURS = 2;

export interface SubmitState {
  ok: boolean;
  message?: string;
}

export async function submitProject(
  projectId: string,
  repoUrl: string,
  notes: string,
): Promise<SubmitState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in" };

  const { data: submission, error } = await supabase
    .from("submissions")
    .upsert(
      {
        user_id: user.id,
        project_id: projectId,
        repo_url: repoUrl || null,
        notes: notes || null,
        submitted_at: new Date().toISOString(),
        status: "grading",
        total_score: null,
        feedback: null,
        graded_at: null,
      },
      { onConflict: "user_id,project_id" },
    )
    .select("id")
    .single();

  if (error || !submission) {
    return { ok: false, message: error?.message ?? "Could not save the submission" };
  }

  try {
    await gradeSubmission(submission.id);
  } catch (e) {
    revalidatePath("/", "layout");
    return { ok: false, message: e instanceof Error ? e.message : "Grading failed" };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function regrade(submissionId: string): Promise<SubmitState> {
  try {
    await gradeSubmission(submissionId);
  } catch (e) {
    revalidatePath("/", "layout");
    return { ok: false, message: e instanceof Error ? e.message : "Grading failed" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Generates this week's brief from its sources and freezes it. A brief that
 * rewords itself on every view is impossible to build against for a week, so
 * this is deliberately write-once unless `force` is passed.
 */
export async function generateProjectBrief(
  topicId: string,
  force = false,
): Promise<SubmitState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in" };

  const { data: topic } = await supabase
    .from("topics")
    .select("id, title, summary, why_it_matters, week_number")
    .eq("id", topicId)
    .single();
  if (!topic) return { ok: false, message: "Topic not found" };

  const { data: existing } = await supabase
    .from("projects")
    .select("id, generated_at")
    .eq("topic_id", topicId)
    .maybeSingle();

  if (existing?.generated_at && !force) {
    return { ok: true };
  }

  const [{ data: course }, { data: sessions }, { data: progress }] = await Promise.all([
    supabase.from("course").select("spine").eq("user_id", user.id).maybeSingle(),
    supabase.from("sessions").select("id, title, source_url, source_kind, note, order_index")
      .eq("topic_id", topicId).order("order_index"),
    supabase.from("session_progress").select("session_id, score").eq("user_id", user.id),
  ]);

  if (!sessions || sessions.length === 0) {
    return { ok: false, message: "This week has no sessions yet, so there is nothing to build a brief from." };
  }

  const scoreBySession = new Map((progress ?? []).map((p) => [p.session_id, p.score]));

  let generated;
  try {
    generated = await generateBrief({
      topicTitle: topic.title,
      topicSummary: topic.summary,
      whyItMatters: topic.why_it_matters,
      weekNumber: topic.week_number,
      spine: course?.spine ?? "A single ongoing system built across the whole course.",
      budgetHours: BUDGET_HOURS,
      sources: sessions.map((s) => ({
        title: s.title,
        url: s.source_url,
        kind: s.source_kind,
        note: s.note,
        recallScore: scoreBySession.get(s.id) ?? null,
      })),
    });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not generate the brief" };
  }

  const row = {
    topic_id: topicId,
    title: generated.title,
    brief: generated.brief,
    hard_constraint: generated.hardConstraint,
    spine_note: generated.spineNote,
    est_hours: generated.estHours,
    is_placeholder: false,
    generated_at: new Date().toISOString(),
    generated_from: {
      sessions: sessions.map((s) => ({
        title: s.title,
        recall: scoreBySession.get(s.id) ?? null,
      })),
    },
  };

  const { data: project, error } = existing
    ? await supabase.from("projects").update(row).eq("id", existing.id).select("id").single()
    : await supabase.from("projects").insert(row).select("id").single();

  if (error || !project) {
    return { ok: false, message: error?.message ?? "Could not save the brief" };
  }

  // Rebuild the rubric: fixed labels, descriptions written for this project.
  await supabase.from("rubric_criteria").delete().eq("project_id", project.id);
  await supabase.from("rubric_criteria").insert(
    generated.rubric.map((r, i) => ({
      project_id: project.id,
      order_index: i + 1,
      label: r.label,
      description: r.description,
      max_points: 20,
    })),
  );

  revalidatePath("/", "layout");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { gradeSubmission } from "@/lib/grade-submission";
import { generateRubric } from "@/lib/rubric";


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
 * Writes this project's rubric from its already-written brief. The brief itself comes
 * from outside the app (handed off into Supabase directly), so this only ever fills in
 * the rubric, never the project's title, brief, or hard constraint.
 */
export async function generateProjectRubric(projectId: string): Promise<SubmitState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in" };

  const { data: project } = await supabase
    .from("projects")
    .select("title, brief, hard_constraint, topic_id")
    .eq("id", projectId)
    .single();
  if (!project) return { ok: false, message: "Project not found" };
  if (!project.brief) return { ok: false, message: "This project has no brief yet" };

  const { data: topic } = await supabase
    .from("topics")
    .select("title, summary, why_it_matters, week_number")
    .eq("id", project.topic_id)
    .single();
  if (!topic) return { ok: false, message: "Topic not found" };

  try {
    const generated = await generateRubric({
      topicTitle: topic.title,
      topicSummary: topic.summary,
      whyItMatters: topic.why_it_matters,
      weekNumber: topic.week_number,
      projectTitle: project.title,
      brief: project.brief,
      hardConstraint: project.hard_constraint,
    });

    await supabase.from("rubric_criteria").delete().eq("project_id", projectId);
    await supabase.from("rubric_criteria").insert(
      generated.criteria.map((c, i) => ({
        project_id: projectId,
        order_index: i + 1,
        label: c.label,
        description: c.description,
        max_points: 20,
      })),
    );
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not generate the rubric" };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

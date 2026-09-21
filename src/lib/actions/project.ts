"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { gradeSubmission } from "@/lib/grade-submission";

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

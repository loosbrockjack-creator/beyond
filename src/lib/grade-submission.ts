import { createClient } from "@/lib/supabase/server";
import { getGrader, type RubricItem } from "@/lib/grader";
import { fetchRepoSnapshot, renderSnapshot } from "@/lib/repo";

/**
 * Grades an existing submission in place. Shared by the server action and the
 * /api/grade route so there is exactly one grading path.
 */
export async function gradeSubmission(submissionId: string): Promise<void> {
  const supabase = await createClient();

  const { data: submission, error } = await supabase
    .from("submissions")
    .select("id, repo_url, notes, project_id")
    .eq("id", submissionId)
    .single();
  if (error || !submission) throw new Error("Submission not found");

  const { data: project } = await supabase
    .from("projects")
    .select("title, brief, hard_constraint")
    .eq("id", submission.project_id)
    .single();
  if (!project) throw new Error("Project not found");

  const { data: criteria } = await supabase
    .from("rubric_criteria")
    .select("id, label, description, max_points")
    .eq("project_id", submission.project_id)
    .order("order_index");

  const rubric: RubricItem[] = (criteria ?? []).map((c) => ({
    id: c.id,
    label: c.label,
    description: c.description,
    maxPoints: c.max_points,
  }));

  const grader = getGrader();
  if (!grader) {
    await supabase
      .from("submissions")
      .update({
        status: "error",
        feedback: "No ANTHROPIC_API_KEY is set, so the grader could not run.",
      })
      .eq("id", submissionId);
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  await supabase.from("submissions").update({ status: "grading" }).eq("id", submissionId);

  // Read the actual code. A failure here is reported to the grader rather than
  // thrown, so a private or missing repo produces an honest low grade instead
  // of a crash.
  let code: string | null = null;
  let codeError: string | null = null;
  if (submission.repo_url) {
    try {
      const snap = await fetchRepoSnapshot(submission.repo_url);
      code = snap.files.length > 0 ? renderSnapshot(snap) : null;
      if (!code) codeError = "The repository contained no readable source files.";
    } catch (e) {
      codeError = e instanceof Error ? e.message : "Could not read the repository.";
    }
  } else {
    codeError = "No repository URL was provided.";
  }

  try {
    const result = await grader.grade({
      projectTitle: project.title,
      brief: project.brief,
      hardConstraint: project.hard_constraint,
      repoUrl: submission.repo_url,
      notes: submission.notes,
      rubric,
      code,
      codeError,
    });

    await supabase.from("rubric_scores").delete().eq("submission_id", submissionId);
    if (result.scores.length > 0) {
      await supabase.from("rubric_scores").insert(
        result.scores.map((s) => ({
          submission_id: submissionId,
          criterion_id: s.criterionId,
          points: s.points,
          comment: s.comment,
        })),
      );
    }

    await supabase
      .from("submissions")
      .update({
        status: "graded",
        total_score: result.total,
        feedback: result.feedback,
        graded_at: new Date().toISOString(),
      })
      .eq("id", submissionId);
  } catch (e) {
    await supabase
      .from("submissions")
      .update({
        status: "error",
        feedback: e instanceof Error ? e.message : "Grading failed",
      })
      .eq("id", submissionId);
    throw e;
  }
}

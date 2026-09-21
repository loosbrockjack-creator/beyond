import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gradeSubmission } from "@/lib/grade-submission";

/**
 * POST { submissionId } - regrades one submission.
 * RLS means a caller can only ever reach their own submissions.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let submissionId: unknown;
  try {
    ({ submissionId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  if (typeof submissionId !== "string") {
    return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
  }

  try {
    await gradeSubmission(submissionId);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Grading failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data } = await supabase
    .from("submissions")
    .select("total_score, feedback, status")
    .eq("id", submissionId)
    .single();

  return NextResponse.json(data);
}

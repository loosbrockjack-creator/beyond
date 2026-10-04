import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBriefForTopic } from "@/lib/generate-brief";

/** POST { topicId, force? } - writes that week's project brief and rubric. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let topicId: unknown, force: unknown;
  try {
    ({ topicId, force } = await request.json());
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }
  if (typeof topicId !== "string") {
    return NextResponse.json({ error: "topicId is required" }, { status: 400 });
  }

  try {
    const result = await generateBriefForTopic(user.id, topicId, force === true);
    const { data } = await supabase
      .from("projects")
      .select("title, brief, hard_constraint, spine_note, est_hours, generated_at")
      .eq("topic_id", topicId)
      .single();
    return NextResponse.json({ ...result, project: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed" },
      { status: 500 },
    );
  }
}

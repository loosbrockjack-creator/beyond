import { createClient } from "@/lib/supabase/server";
import { generateBrief } from "@/lib/brief";

/** Weekly project budget. Deliberately small so it survives sixteen weeks. */
const BUDGET_HOURS = 2;

/**
 * Generates this week's brief from its sources and freezes it. A brief that
 * rewords itself on every view is impossible to build against for a week, so
 * this is deliberately write-once unless `force` is passed.
 */
export async function generateBriefForTopic(
  userId: string,
  topicId: string,
  force = false,
): Promise<{ generated: boolean }> {
  const supabase = await createClient();

  const { data: topic } = await supabase
    .from("topics")
    .select("id, title, summary, why_it_matters, week_number")
    .eq("id", topicId)
    .single();
  if (!topic) throw new Error("Topic not found");

  const { data: existing } = await supabase
    .from("projects")
    .select("id, generated_at")
    .eq("topic_id", topicId)
    .maybeSingle();

  if (existing?.generated_at && !force) {
    return { generated: false };
  }

  const [{ data: course }, { data: sessions }, { data: progress }] = await Promise.all([
    supabase.from("course").select("spine").eq("user_id", userId).maybeSingle(),
    supabase.from("sessions").select("id, title, source_url, source_kind, note, order_index")
      .eq("topic_id", topicId).order("order_index"),
    supabase.from("session_progress").select("session_id, score").eq("user_id", userId),
  ]);

  if (!sessions || sessions.length === 0) {
    throw new Error("This week has no sessions yet, so there is nothing to build a brief from.");
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
    throw new Error(e instanceof Error ? e.message : "Could not generate the brief");
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
    throw new Error(error?.message ?? "Could not save the brief");
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

  return { generated: true };
}

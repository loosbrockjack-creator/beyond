import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

export interface BriefSource {
  title: string;
  url: string | null;
  kind: string;
  note: string | null;
  /** Recall score for this session, if it has been done. Null when not. */
  recallScore: number | null;
}

export interface BriefRequest {
  topicTitle: string;
  topicSummary: string | null;
  whyItMatters: string | null;
  weekNumber: number;
  spine: string;
  budgetHours: number;
  sources: BriefSource[];
}

export interface GeneratedBrief {
  title: string;
  brief: string;
  hardConstraint: string;
  spineNote: string;
  estHours: number;
  rubric: { label: string; description: string }[];
}

/** Fixed labels, project-specific descriptions. Keeps grading comparable week to week. */
const RUBRIC_LABELS = [
  "Works end to end",
  "Correct core mechanic",
  "Handles failure",
  "Readable",
  "Documented",
] as const;

const BriefSchema = z.object({
  title: z.string().describe("Short imperative project title, at most 8 words"),
  brief: z
    .string()
    .describe(
      "The brief itself, 120 to 200 words. Plain prose and short bullet lines. State what to build and the constraints. No preamble, no encouragement, no markdown headings.",
    ),
  hard_constraint: z
    .string()
    .describe(
      "One sentence naming the single constraint that cannot be satisfied without genuinely understanding this week's material.",
    ),
  spine_note: z
    .string()
    .describe("One sentence on how this week's layer fits the larger system being built."),
  est_hours: z.number().describe("Realistic hours for someone competent but new to this material"),
  rubric: z
    .array(z.object({ label: z.string(), description: z.string() }))
    .describe(
      "Exactly five entries, in order, using the five given labels verbatim. Each description is one sentence naming what specifically to look for in THIS project.",
    ),
});

function system(budgetHours: number): string {
  return `You write weekly build briefs for a self-directed course on building with AI.

The single rule: the brief must contain a constraint that cannot be satisfied without
genuinely understanding that week's material. If the project could be completed by
someone who only skimmed the sources, the brief has failed. Prefer constraints that
force a specific mechanic, such as "the tool must fail intermittently and the agent must
recover without looping forever", over vague asks like "build something useful".

Hard budget: ${budgetHours} hours. This is a working adult fitting the build around a
business and school. A brief that takes longer will simply not get done, which is worse
than a smaller brief that does. Cut scope until it fits. One sharp mechanic beats three
shallow ones.

Every week adds one thin layer to the same ongoing system, described below. Say plainly
how this week's layer attaches to it. Do not restart from scratch each week.

Write in plain, direct prose. No enthusiasm, no "dive in", no em dashes. Address the
reader as you. Assume competence.`;
}

export async function generateBrief(req: BriefRequest): Promise<GeneratedBrief> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set, so briefs cannot be generated");

  const client = new Anthropic({ apiKey: key });

  const weakest = req.sources
    .filter((s) => s.recallScore != null && s.recallScore < 100)
    .map((s) => `${s.title} (recalled ${s.recallScore}%)`);

  const sourceList = req.sources
    .map(
      (s, i) =>
        `${i + 1}. ${s.title} [${s.kind}]${s.url ? ` ${s.url}` : ""}` +
        (s.note ? `\n   Framing: ${s.note}` : "") +
        (s.recallScore != null ? `\n   Recall score: ${s.recallScore}%` : "\n   Not yet done"),
    )
    .join("\n");

  const prompt = [
    `WEEK ${req.weekNumber}: ${req.topicTitle}`,
    req.topicSummary ? `\n${req.topicSummary}` : "",
    req.whyItMatters ? `\nWhy it matters: ${req.whyItMatters}` : "",
    `\n\nTHE ONGOING SYSTEM:\n${req.spine}`,
    `\n\nTHIS WEEK'S SOURCES:\n${sourceList}`,
    weakest.length > 0
      ? `\n\nRECALLED WORST, so aim the hard constraint here:\n${weakest.join("\n")}`
      : `\n\nNo recall data yet. Aim the hard constraint at the most central idea in the sources.`,
    `\n\nRUBRIC LABELS, use these five verbatim and in order:\n${RUBRIC_LABELS.join("\n")}`,
  ].join("");

  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    system: system(req.budgetHours),
    messages: [{ role: "user", content: prompt }],
    output_config: { format: zodOutputFormat(BriefSchema) },
  });

  const parsed = response.parsed_output;
  if (!parsed) throw new Error("The brief generator returned an unparseable response");

  // Trust the labels, not the model, so grading stays comparable across weeks.
  const rubric = RUBRIC_LABELS.map((label, i) => ({
    label,
    description: parsed.rubric[i]?.description ?? "",
  }));

  return {
    title: parsed.title,
    brief: parsed.brief,
    hardConstraint: parsed.hard_constraint,
    spineNote: parsed.spine_note,
    estHours: parsed.est_hours,
    rubric,
  };
}

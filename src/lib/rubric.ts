import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

export interface RubricRequest {
  topicTitle: string;
  topicSummary: string | null;
  whyItMatters: string | null;
  weekNumber: number;
  projectTitle: string;
  brief: string;
  hardConstraint: string | null;
}

export interface GeneratedRubric {
  criteria: { label: string; description: string }[];
}

/**
 * Fixed labels, project-specific descriptions. Keeps grading comparable week to week.
 * These judge the brief (the student's account of how they used this week's principle),
 * not a finished repository, since the grader no longer treats code as ground truth.
 */
const RUBRIC_LABELS = [
  "Applies the core idea",
  "Reasoned tradeoffs",
  "Fit for the use case",
  "Honest about the gaps",
  "Clear enough to grade",
] as const;

const RubricSchema = z.object({
  criteria: z
    .array(z.object({ label: z.string(), description: z.string() }))
    .describe(
      "Exactly five entries, in order, using the five given labels verbatim. Each description " +
        "is one sentence naming what a strong brief for THIS project would specifically say, not " +
        "what the code would do.",
    ),
});

const SYSTEM = `You write grading rubrics for a self-directed course on building with AI.

The student does not submit a finished product for review. They submit a short brief:
what they built, how they applied this week's principle, the tradeoffs they weighed, and
where they are unsure. A repository link may exist but is secondary context, not the
thing being graded. Write rubric criteria that can be judged entirely from a well written
brief, never ones that require opening code.

Each description should name, specifically for this project, what a strong account of
applying this week's principle looks like, so a thin or generic brief ("I built it and it
works") cannot score well regardless of label.

Write in plain, direct prose. No enthusiasm, no em dashes.`;

export async function generateRubric(req: RubricRequest): Promise<GeneratedRubric> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set, so the rubric cannot be generated");

  const client = new Anthropic({ apiKey: key });

  const prompt = [
    `WEEK ${req.weekNumber}: ${req.topicTitle}`,
    req.topicSummary ? `\n${req.topicSummary}` : "",
    req.whyItMatters ? `\nWhy it matters: ${req.whyItMatters}` : "",
    `\n\nPROJECT: ${req.projectTitle}`,
    `\n\nBRIEF:\n${req.brief}`,
    req.hardConstraint ? `\n\nTHE POINT OF THE WEEK:\n${req.hardConstraint}` : "",
    `\n\nRUBRIC LABELS, use these five verbatim and in order:\n${RUBRIC_LABELS.join("\n")}`,
  ].join("");

  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    system: SYSTEM,
    messages: [{ role: "user", content: prompt }],
    output_config: { format: zodOutputFormat(RubricSchema) },
  });

  const parsed = response.parsed_output;
  if (!parsed) throw new Error("The rubric generator returned an unparseable response");

  // Trust the labels, not the model, so grading stays comparable across weeks.
  const criteria = RUBRIC_LABELS.map((label, i) => ({
    label,
    description: parsed.criteria[i]?.description ?? "",
  }));

  return { criteria };
}

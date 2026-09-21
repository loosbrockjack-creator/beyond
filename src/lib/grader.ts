import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

export interface RubricItem {
  id: string;
  label: string;
  description: string | null;
  maxPoints: number;
}

export interface GradeRequest {
  projectTitle: string;
  brief: string | null;
  repoUrl: string | null;
  notes: string | null;
  rubric: RubricItem[];
}

export interface CriterionScore {
  criterionId: string;
  points: number;
  comment: string;
}

export interface GradeResult {
  scores: CriterionScore[];
  total: number;
  feedback: string;
}

export interface Grader {
  grade(req: GradeRequest): Promise<GradeResult>;
}

/**
 * Index-based rather than id-based: the model reliably echoes a small integer,
 * where it can mangle a uuid. Indexes map back to criterion ids on the server.
 */
const GradeSchema = z.object({
  scores: z.array(
    z.object({
      index: z.number().int().describe("The 1-based index of the rubric criterion"),
      points: z.number().int().describe("Points awarded, never above that criterion's maximum"),
      comment: z.string().describe("One sentence on why, naming something concrete"),
    }),
  ),
  feedback: z
    .string()
    .describe(
      "Two to four sentences of overall feedback. Lead with the strongest part, then the single most useful thing to fix.",
    ),
});

const SYSTEM = `You grade weekly build projects for a self-directed course on building with AI.

You are grading one student who is deliberately holding themselves to a high bar. Be
accurate rather than encouraging. A project that merely runs is not full marks; full
marks means there is genuinely nothing worth changing.

You are given the rubric, the project brief, a repository link and the student's own
notes. You cannot open the repository, so grade what you can actually see: the notes,
any code pasted into them, and what the brief asked for. When the notes are too thin to
judge a criterion, say so in that criterion's comment and score it conservatively rather
than assuming the best.

Award whole points only, never more than a criterion's maximum. Return one score per
criterion, in order.`;

export class AIGrader implements Grader {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async grade(req: GradeRequest): Promise<GradeResult> {
    const rubricText = req.rubric
      .map((c, i) => `${i + 1}. ${c.label} (max ${c.maxPoints}) - ${c.description ?? ""}`)
      .join("\n");

    const prompt = [
      `PROJECT: ${req.projectTitle}`,
      req.brief ? `\nBRIEF:\n${req.brief}` : "",
      `\nRUBRIC:\n${rubricText}`,
      `\nREPOSITORY: ${req.repoUrl ?? "not provided"}`,
      `\nSTUDENT NOTES:\n${req.notes?.trim() || "(none provided)"}`,
    ].join("\n");

    const response = await this.client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 16000,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
      output_config: { format: zodOutputFormat(GradeSchema) },
    });

    const parsed = response.parsed_output;
    if (!parsed) throw new Error("The grader returned an unparseable response");

    const scores: CriterionScore[] = [];
    for (const s of parsed.scores) {
      const criterion = req.rubric[s.index - 1];
      if (!criterion) continue;
      scores.push({
        criterionId: criterion.id,
        // Clamp: the schema cannot express a per-criterion maximum.
        points: Math.max(0, Math.min(criterion.maxPoints, Math.round(s.points))),
        comment: s.comment,
      });
    }

    const total = scores.reduce((sum, s) => sum + s.points, 0);
    return { scores, total, feedback: parsed.feedback };
  }
}

export function getGrader(): Grader | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new AIGrader(key);
}

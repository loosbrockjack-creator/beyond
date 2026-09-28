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
  hardConstraint: string | null;
  repoUrl: string | null;
  notes: string | null;
  rubric: RubricItem[];
  /** The actual source, fetched from GitHub. Null when it could not be read. */
  code: string | null;
  codeError: string | null;
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
accurate rather than encouraging. A project that merely runs is not full marks. Full
marks means there is genuinely nothing worth changing.

You are given the rubric, the brief, the brief's hard constraint, the student's notes,
and the actual source code from their repository. Grade the code. The notes are context
for intent, not evidence. When the code contradicts the notes, the code wins.

The hard constraint is the point of the week. If the code does not genuinely satisfy it,
"Correct core mechanic" cannot score above half, no matter how polished the rest is.
Faking it counts as not satisfying it: a retry loop in code is not the same as returning
an error into the model's context, and a turn counter is not the same as a real stopping
condition.

Every comment must cite something specific: a file, a function, a line of reasoning about
what the code actually does. "Good error handling" is a useless comment. "loop.py:44
catches the timeout and retries in code, where the brief asked for the error to return
into context" is a useful one.

If the source could not be read, say so plainly in every affected comment and score
conservatively rather than assuming the best.

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
      req.hardConstraint ? `\nHARD CONSTRAINT (the point of the week):\n${req.hardConstraint}` : "",
      `\nRUBRIC:\n${rubricText}`,
      `\nREPOSITORY: ${req.repoUrl ?? "not provided"}`,
      `\nSTUDENT NOTES:\n${req.notes?.trim() || "(none provided)"}`,
      req.code
        ? `\n\nSOURCE CODE:\n${req.code}`
        : `\n\nSOURCE CODE: could not be read. ${req.codeError ?? ""}`,
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

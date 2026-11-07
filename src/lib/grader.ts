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
  /** The student's write-up: how they used this week's principle. The primary evidence. */
  studentBrief: string | null;
  rubric: RubricItem[];
  /** The actual source, fetched from GitHub. Secondary: a contradiction check, not evidence. */
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
      "Two to four sentences of overall feedback on the approach described in the brief. Lead " +
        "with the strongest part of how they applied this week's principle, then the single most " +
        "useful better way they could have applied it.",
    ),
});

const SYSTEM = `You grade weekly build projects for a self-directed course on building with AI.

You are grading one student who is deliberately holding themselves to a high bar. Be
accurate rather than encouraging. A thin brief that merely asserts success is not full
marks. Full marks means the brief shows real, specific understanding of this week's
principle and good judgment in applying it.

The student's brief is the primary evidence: a short account of what they built, how
they used this week's principle, the tradeoffs they weighed, and where they are unsure.
You do not have the full history of what they did while building it, so you are grading
the account, not reverse-engineering a finished product. A repository link may be given
as secondary context. If its code plainly contradicts a specific claim in the brief,
say so and weigh it down, but do not score against code the brief never claimed to have
written, and do not penalize the brief for a repository that is missing, private, or
unreadable: say that plainly where relevant and grade the brief on its own terms.

The hard constraint, when given, is the point of the week. A brief that does not address
it, or addresses it with something that only superficially resembles it, cannot score
well on whichever criterion covers it, no matter how well-written the rest is.

For every criterion, give concrete feedback: what the brief specifically said that earned
or cost points, and when it falls short, name a better way they could have applied this
week's principle, not just "add more detail." "Good use of retries" is a useless comment.
"The brief says it retries on failure but never says what signal tells it to stop, which
is the actual hard part this week; a real stopping condition, like checking the error
type before retrying, would have been a stronger brief" is a useful one.

If the brief is missing or too thin to evaluate, say so plainly and score conservatively
rather than assuming the best.

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
      req.brief ? `\nASSIGNED BRIEF:\n${req.brief}` : "",
      req.hardConstraint ? `\nHARD CONSTRAINT (the point of the week):\n${req.hardConstraint}` : "",
      `\nRUBRIC:\n${rubricText}`,
      `\nSTUDENT'S BRIEF (the primary evidence, grade this):\n${req.studentBrief?.trim() || "(none provided)"}`,
      `\nREPOSITORY (secondary context only): ${req.repoUrl ?? "not provided"}`,
      req.code
        ? `\n\nSOURCE CODE, for checking contradictions only:\n${req.code}`
        : `\n\nSOURCE CODE: could not be read. ${req.codeError ?? "No repository was provided."} This is not a mark against the brief by itself.`,
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

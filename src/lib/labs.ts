/**
 * Interactive exercises attached to a topic. Pure: no Supabase, no React.
 *
 * Lab content lives here rather than in the database on purpose. Seeded course content
 * (sessions, recalls, quizzes, projects) is data because it changes every week. A lab is
 * a built artifact with its own behaviour, so it belongs with the code that renders it,
 * and the week 1 brief rules out new tables.
 *
 * Keyed by topic slug, never by topic or week number, so reordering the course stays a
 * data migration and a lab travels with the topic it belongs to.
 */

export type Answer = "workflow" | "agent";

export interface Attribution {
  model: string;
  harness: string;
  environment: string;
}

export interface Scenario {
  id: string;
  title: string;
  /** The situation. Written to be read once, not studied. */
  body: string;
  answer: Answer;
  /** Revealed after the choice. Argues from who picks the next action. */
  explanation: string;
  /** Only on the scenario that asks the learner to name the three parts. */
  attribution?: Attribution;
}

export interface Lab {
  topicSlug: string;
  title: string;
  lead: string;
  /** What each choice means, shown above the scenarios and in every reveal. */
  rubric: { workflow: string; agent: string };
  scenarios: Scenario[];
}

const LABS: Lab[] = [
  {
    topicSlug: "agents-and-agentic-systems",
    title: "Agent or Workflow?",
    lead:
      "Three systems. For each one, decide whether it is a workflow or an agent. The test is not how capable the model is, it is who picks the next action.",
    rubric: {
      workflow: "The path is mostly predefined. Someone wrote the sequence in advance.",
      agent:
        "The goal, tools, context and limits are defined. The system decides more of the path while it runs.",
    },
    scenarios: [
      {
        id: "nightly-digest",
        title: "The nightly call digest",
        body:
          "Every night at 2am a job runs for Callvia. It pulls yesterday's calls from the database, sends each transcript to a model with the same summarize prompt, writes the summaries into a report table, and emails the contractor one digest. Same five steps, same order, every night. If the email fails it retries twice, then gives up.",
        answer: "workflow",
        explanation:
          "The path was decided when the job was written. The model does one job inside step two, turning a transcript into prose, and it never chooses what happens next. Even the retry is predefined: twice, then stop. A capable model sitting inside a fixed sequence does not make the sequence agentic.",
      },
      {
        id: "inbound-call",
        title: "The inbound call that has to end somewhere",
        body:
          "A caller tells Callvia their furnace is out. The system has one goal, reach a terminal outcome: booked, or handed to a human. It has three tools: look up the customer, check the calendar, book a slot. The calendar times out sometimes. On this call it looked the caller up first, found no record, asked for an address, checked two different days because the first had nothing open, retried one timeout, then booked. On the next call it will not necessarily do any of that in that order.",
        answer: "agent",
        explanation:
          "You defined the goal, the tools and the limits. You did not define the sequence. Whether to look the caller up first, how many days to offer, whether a timeout is worth another try, and when to stop trying and pass the call to a person: all of it was chosen during the call, from what the previous step returned.",
        attribution: {
          model:
            "The model choosing each next action from what the last tool returned. Swap it for a better one and the system still works the same way.",
          harness:
            "Callvia's own loop. The three tool definitions, the retry rule, the stopping condition, the handoff to a human, and the Retell voice layer turning speech into turns and back.",
          environment:
            "What it is allowed to touch. The customer and booking tables in Supabase, the contractor's calendar, and the live phone call itself.",
        },
      },
      {
        id: "skill-off-script",
        title: "The skill that went off script",
        body:
          "You keep a post-drafting skill in Claude Code. It says: read the brand notes, draft three conversation starters, never pitch anything, stop. You run it every other Friday and it does the same thing every time. On last Friday's run it noticed the brand notes contradicted a post you had already published, went and read that old post without being told to, and rewrote two of the drafts so they would not repeat it.",
        answer: "agent",
        explanation:
          "Workflow is the plausible answer here: it is a saved skill, the steps are written down, and you run it on a schedule. But a skill is a brief, not a program. It fixed the goal, the constraints and the output format. It never fixed the sequence. The moment the run contained a step nobody specified, chosen because of something noticed partway through, the path was being decided at runtime. Rewrite the skill as read exactly these two files, produce three drafts, stop, and the same tool in the same editor becomes a workflow. What decides this is who picked the next action, not which model you used.",
      },
    ],
  },
];

export function labForTopic(topicSlug: string): Lab | null {
  return LABS.find((l) => l.topicSlug === topicSlug) ?? null;
}

/** How many of `answers` match, for a score out of `scenarios.length`. */
export function scoreLab(lab: Lab, answers: Record<string, Answer | undefined>): number {
  return lab.scenarios.filter((s) => answers[s.id] === s.answer).length;
}

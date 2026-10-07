# AI Learning Implementation Completion Note

Week 1: Agents and Agentic Systems. Project `b65762c9-c55b-45fd-b4d0-7d90644f2e45`,
"Agent or Workflow? Decision Lab".

## Concept

One line decides whether a system is a workflow or an agent: who picks the next action.

A workflow is a sequence somebody wrote in advance. A model can sit inside it and do
real work, and it is still a workflow, because the model never chooses what happens
next. An agent is given a goal, tools, context and limits, and then chooses the path
itself while it runs, including when to stop.

The trap this lab is built to catch is judging by the tool instead of the control. A
very capable model inside a fixed sequence is still a workflow. A modest model choosing
its own next step is an agent. Capability and shape are independent, and conflating
them is the single most common week 1 mistake.

## What changed

A three scenario exercise at `/m/[module]/topics/[topic]/lab`, reachable from the week's
topic page and from the project page. For each scenario the learner picks Workflow or
Agent, the explanation reveals immediately on that choice, and a running score out of 3
sits at the bottom. One scenario also breaks out model, harness and environment.

The three scenarios and what each one is for:

1. **The nightly call digest.** Answer: workflow. A fixed five step job with one model
   call inside step two, plus a predefined retry. This is the control case: a capable
   model doing real work inside a path that was decided when the job was written.
2. **The inbound call that has to end somewhere.** Answer: agent. A goal with a terminal
   outcome, three tools, a flaky calendar, and a sequence that came out differently on
   this call than it will on the next. This is the scenario that names the three parts:
   the model choosing each next action, the harness that is Callvia's own loop plus the
   tool definitions, retry rule, stopping condition, handoff and voice layer, and the
   environment of the Supabase tables, the contractor's calendar and the live call. It
   is also the required custom external agent running inside a business process.
3. **The skill that went off script.** Answer: agent. This is the deliberately ambiguous
   one the hard constraint asks for, and the required "existing agent with a repeatable
   skill" case. Everything about it reads workflow: a saved skill, written steps, a
   schedule, the same result every time. It is an agent because on this run it took a
   step nobody specified, chosen from something it noticed partway through. The reveal
   names workflow as the plausible answer and then argues from control of the path, and
   it says what would have made the same tool a workflow instead.

No new tables, no new course structure, no change to the brief, the rubric, the course
order or any unrelated record.

## Why this approach was chosen

**Lab content lives in code, not the database.** Seeded content (sessions, recalls,
quizzes, projects) is data because it changes every week and is written by the tutor. A
lab is a built artifact with behaviour, so it belongs with the code that renders it. The
brief also rules out new tables, which settles it.

**Keyed by topic slug, never by week or topic number.** `src/lib/labs.ts` looks a lab up
by slug, so reordering the course stays a data migration, which is the existing
architectural rule. A lab travels with its topic instead of with a position.

**Nothing is persisted.** The score is React state and resets on reload. Storing it
would have meant a new table, and the lab gates nothing, so there is no reason for the
score to outlive the sitting.

**Immediate reveal per scenario, not a submit button.** The brief says the explanation
appears after each choice. That also makes it a teaching tool rather than a test: you
find out you were wrong while the scenario is still in your head.

**The UI reuses the recall pattern rather than inventing one.** Same borders, same
accent-dim on the right answer, same `X` in faint grey for a wrong pick, same score
treatment where the accent only appears on a perfect run. Correctness is carried by
weight, wording and an icon, never by colour, because the palette has no red or amber by
design.

## Files changed

Added:
- `src/lib/labs.ts`, the lab content plus `labForTopic` and `scoreLab`. Pure, no Supabase.
- `src/components/lab/DecisionLab.tsx`, the client component.
- `src/app/(app)/m/[module]/topics/[topic]/lab/page.tsx`, the route.

Edited:
- `src/app/(app)/m/[module]/topics/[topic]/page.tsx`, a link in the project section when
  the topic has a lab.
- `src/app/(app)/m/[module]/assignments/[project]/page.tsx`, the same link on the
  project page.

## Verification performed

Passing:
- `npm run build`, exit 0, with `/m/[module]/topics/[topic]/lab` registered in the route
  table. Typecheck runs inside the build and is clean.
- 12 assertions over the lab module: three scenarios, both answers used, every scenario
  has an explanation, exactly one scenario carries model/harness/environment and it is an
  agent scenario, all three parts filled, no em dashes, and an unrelated topic slug
  returns no lab.
- Scoring at every value: all correct gives 3/3, nothing answered gives 0/3, one wrong
  gives 2/3, all inverted gives 0/3.
- The route is served by the dev server rather than erroring.

Not verified: the signed-in pages were never rendered. Beyond requires an email and
password login that this session does not have, so the build proves the component
compiles but nothing here proves it looks and behaves right on screen. The four clicks
worth doing by hand: answer one scenario and confirm the explanation appears and the
count moves to 1/3, answer the other two and confirm 3/3 turns mint, get one wrong
deliberately and confirm the heading reads the correct answer with no red anywhere, and
press Start over to confirm it returns to 0/3 with every choice re-enabled.

## How this connects to the learning concept

Week 1 taught the distinction. This lab makes you apply it to cases where the surface
features point the wrong way, which is the only place the distinction is worth anything.
Scenario 1 has a capable model and is still a workflow. Scenario 3 has a saved skill, a
schedule and a predictable output, and is an agent. If you can only classify the clean
cases, you cannot use the concept on your own systems, because real systems look like
scenario 3.

The model, harness and environment split in scenario 2 is the other half. It is what
lets you say which part of a system you would change. Poor tool definitions or a missing
stopping condition are harness problems, and swapping models will not fix them. Knowing
which of the three is at fault is most of debugging an agent.

## What the learner should understand now

- The test is who chooses the next action, not how smart the thing doing the work is.
- A fixed goal does not make something a workflow. Scenario 3's goal and output format
  were both fixed and it was still an agent, because the sequence was not.
- A human approving each step is a guardrail on the actions, not authorship of the path.
- Model, harness and environment are separable, and naming which one is failing is how
  you stop guessing when an agent misbehaves.
- Agent is not the better answer. It is the answer when you cannot predict the steps.
  Scenario 1 should stay a workflow, because a predictable path is cheaper and easier to
  reason about.

## Problems or tradeoffs encountered

- **The score does not persist.** Deliberate, since persisting it needs a table the brief
  forbids. If the lab ever needs to count toward anything, that decision changes.
- **One lab, hardcoded content, in a list.** Fine at one entry and honest at three or
  four. If labs become a per week habit, the content should move to the database and
  follow the session pattern instead, and that is a real migration, not a refactor.
- **Scenario 3's answer is arguable, on purpose.** Someone could insist it is a workflow
  that deviated once. The reveal takes a position and explains it rather than hedging,
  which is what the hard constraint asked for, but it is the one scenario where a
  thoughtful disagreement is possible.
- **The lab is reachable whether or not the project is submitted.** It is practice, not
  an assessment, so gating it seemed worse than leaving it open.

## Good follow-up questions

- Which parts of Callvia are workflows today that would be better as agents, and which
  are agents that would be cheaper and more reliable as workflows?
- Scenario 2's harness holds the retry rule and the stopping condition. If the call
  handler started giving up too early, how would you tell a harness problem from a model
  problem before changing anything?
- Where is the line between a skill that is a brief and a skill that is a program, and
  which of your own skills are on the wrong side of it for what you want them to do?
- If a human approves every tool call, what has that actually bought you, and what does
  it leave unprotected?

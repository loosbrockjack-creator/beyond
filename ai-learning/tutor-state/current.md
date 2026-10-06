# Current Tutor State

## Repository current week

Week 2: Working effectively with AI coding agents

## Most recent synced learning

Week 1: Agents and agentic systems

The learning signals below came from the Week 1 tutor chat. They should be treated as prior knowledge carried into Week 2, not as evidence of what was learned during Week 2.

## Durable understanding from Week 1

- A workflow follows a mostly predefined path; an agent is given a goal, tools, context, and constraints, then decides more of the path itself.
- The model is the intelligence, the harness is the system around the model that manages agent behavior and tool use, and the environment is where work is executed.
- OpenAI's Agents API is infrastructure for building agents, not a generic prebuilt agent that automatically improves outputs.
- A custom agent is useful when a task should run as its own repeatable system with specific tools, data, triggers, permissions, and outputs. ChatGPT, Claude, Codex, and Claude Code are existing agentic systems that can often be used directly instead.
- A skill inside Claude Code or Codex gives an existing agent a repeatable capability. A custom external agent is a separate system that Codex or Claude Code can help build and that can later operate independently.
- Compaction manages large current-task context. It is not the same as long-term memory, which requires information to be stored and retrieved across sessions.

## Meaningful misconceptions corrected in Week 1

- The learner initially treated the Agents API as if it were itself a broad general-purpose agent. It is better understood as managed infrastructure for creating agents.
- The learner initially treated Claude itself as the harness. Claude is the model; Claude Code is an example of a harness around the model.
- The learner initially expected a generated weekly project to appear as a GitHub project file. In the current Beyond design, the generated project brief lives in Supabase and Claude Code reads it from there.

## Durable learning preferences

- Prefer concise explanations that preserve the key mental model.
- Avoid unnecessary developer vocabulary unless it is needed to understand the system.
- Focus on concepts that improve the learner's ability to direct increasingly capable AI systems.
- Freshness matters because AI tools and best practices change quickly.

## Carry-forward implication for Week 2

Do not assume the Week 1 agent-architecture discussion counts as Week 2 learning. Week 2 should separately assess and reinforce the learner's ability to direct coding agents through clear briefs, relevant context, acceptance checks, verification, and failure diagnosis.

## Sync rule

When the learner says "Sync learning state", replace this file with a concise update containing only:
- durable understanding,
- meaningful misconceptions,
- unresolved questions,
- important realizations,
- implementation ideas worth preserving.

Do not store full conversation transcripts.

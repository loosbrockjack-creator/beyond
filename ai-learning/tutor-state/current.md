# Current Tutor State

## Current week

Week 2: Working effectively with AI coding agents

## Durable understanding

- A workflow follows a mostly predefined path; an agent is given a goal, tools, context, and constraints, then decides more of the path itself.
- The model is the intelligence, the harness is the system around the model that manages agent behavior and tool use, and the environment is where work is executed.
- OpenAI's Agents API is infrastructure for building agents, not a generic prebuilt agent that automatically improves outputs.
- A custom agent is useful when a task should run as its own repeatable system with specific tools, data, triggers, permissions, and outputs. ChatGPT, Claude, Codex, and Claude Code are existing agentic systems that can often be used directly instead.
- A skill inside Claude Code or Codex gives an existing agent a repeatable capability. A custom external agent is a separate system that Codex or Claude Code can help build and that can later operate independently.
- Compaction manages large current-task context. It is not the same as long-term memory, which requires information to be stored and retrieved across sessions.
- Coding agents already know many implementation patterns. The learner's highest-leverage role is to define the outcome, relevant context, constraints, tools, acceptance checks, and what must be verified, rather than memorizing low-level implementation details.
- In the Beyond learning workflow, the ChatGPT Tutor defines the weekly learning project and stores it in Supabase; Claude Code's role is to implement that project in the application.

## Meaningful misconceptions corrected

- The learner initially treated the Agents API as if it were itself a broad general-purpose agent. It is better understood as managed infrastructure for creating agents.
- The learner initially treated Claude itself as the harness. Claude is the model; Claude Code is an example of a harness around the model.
- The learner initially expected a generated weekly project to appear as a GitHub project file. In the current Beyond design, the generated project brief lives in Supabase and Claude Code reads it from there.

## Current learning edge

The learner understands the core agent architecture well enough to move away from developer-heavy API details. The next useful practice is directing a coding agent through a small end-to-end loop:

- define the outcome before implementation,
- give enough context without micromanaging,
- define acceptance checks before the build,
- let the coding agent choose implementation details,
- verify the result with evidence,
- diagnose a failed check before asking for a fix.

## Durable learning preferences

- Prefer concise explanations that preserve the key mental model.
- Avoid unnecessary developer vocabulary unless it is needed to understand the system.
- Focus on concepts that improve the learner's ability to direct increasingly capable AI systems.
- Freshness matters because AI tools and best practices change quickly.

## Current strategic question

As coding agents become more capable, which human decisions remain scarce and valuable?

Current answer: deciding what should be built, defining success and constraints, supplying the right context, choosing what evidence counts as verification, diagnosing failures, and connecting AI systems to real business value.

## Sync rule

When the learner says "Sync learning state", replace this file with a concise update containing only:
- durable understanding,
- meaningful misconceptions,
- unresolved questions,
- important realizations,
- implementation ideas worth preserving.

Do not store full conversation transcripts.

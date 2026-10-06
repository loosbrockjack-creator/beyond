# AI Learning System Instructions

These instructions apply to learning-driven work under `ai-learning/`.

## Core rule

Learning files are context, not automatic tasks.

Do not modify product behavior simply because a concept, idea, or question appears in:
- a weekly curriculum,
- tutor state,
- feedback,
- the roadmap.

Implementation requires an explicit implementation brief or GitHub issue.

## Weekly project implementation

When the user asks you to implement the current or previous required weekly project, do not search the repository for a generated project file.

The ChatGPT Tutor writes generated weekly projects directly into the Beyond Supabase database. Treat the database row as the authoritative project brief.

Use Supabase project `jlafnhtkygcukkbhwndy` and:

1. Read `ai-learning/current-week.md` to determine the week.
2. Find the matching row in `topics` by `week_number`.
3. Read the non-placeholder `projects` row for that `topic_id`.
4. Read the related `rubric_criteria`, ordered by `order_index`.
5. Implement that project in the Beyond application unless the brief explicitly says it is a standalone practice artifact.
6. Do not rewrite or replace the project brief or rubric unless the user explicitly asks.
7. If no non-placeholder project exists for that week, say so instead of inventing one.

A generated weekly project in Supabase counts as the explicit implementation brief for that required weekly project.

## When handling an AI learning implementation

Read, in this order:

1. `ai-learning/current-week.md`
2. the current weekly curriculum linked from that file, if present
3. `ai-learning/tutor-state/current.md`
4. the implementation brief or GitHub issue
5. the relevant application code
6. all root project instructions

Then:

1. Inspect the current architecture before proposing changes.
2. Prefer the smallest useful implementation.
3. Explain the plan and tradeoffs clearly.
4. Preserve all existing Beyond design, course-order, security, and architecture rules.
5. Do not alter the learning roadmap or course order unless the task explicitly requests it.
6. Test the implementation.
7. Always run `npm run build` before calling a code change complete.
8. For learning-driven implementation work, add a completion note under `ai-learning/implementation/completed/`.

## Completion note

The completion note should explain:
- the concept being applied,
- what changed,
- why the approach was chosen,
- files changed,
- verification performed,
- how the implementation connects to the learning concept,
- what the learner should understand now,
- important tradeoffs or follow-up questions.

## Communication style

The user is learning AI at a system-design level, not training to become a traditional software engineer.

When explaining implementation choices:
- explain the mental model first,
- distinguish durable concepts from framework-specific detail,
- avoid unnecessary jargon,
- include technical detail when it is necessary to understand the system,
- connect implementation choices back to long-term AI leverage.

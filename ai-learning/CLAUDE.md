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

The ChatGPT Tutor maintains **one active project per topic** in the Beyond Supabase database. Some approved projects also have a more detailed GitHub implementation brief. Do not confuse historical implementation completion notes with the active project.

Use Supabase project `jlafnhtkygcukkbhwndy` and:

1. Respect the **week explicitly requested by the learner**, even if `ai-learning/current-week.md` points at a later learning week.
2. Find the `topics` row by `week_number`.
3. Read the matching non-placeholder `projects` row and related `rubric_criteria` sorted by `order_index`.
4. If the project row's `generated_from.repo_brief` is present, read **that exact path**. It is the detailed approved scope. Check that the GitHub title/week and Supabase title/week refer to the same active project. If they disagree, stop rather than improvising.
5. Inspect the existing application and connected tools before proposing implementation.
6. Respect any pre-implementation learner checkpoint in the brief: show the plan and **wait for the learner to approve it** before writing code.
7. Follow the brief's placement (standalone prototype vs. application integration); don't force a standalone experiment into Beyond's existing UI.
8. Do not replace any project, rubric, course order, or unrelated records while implementing.
9. If no active project is found, say so instead of inventing one.

### Historical Week 1 boundary

Active project: **AI Internship Intelligence Agent**.
- Detailed brief: `ai-learning/projects/week-01-internship-intelligence-agent.md`
- Its Supabase row and rubric are the matching active Week 1 assignment.
- The old **Agent or Workflow? Decision Lab** is already implemented, but is **historical**, not the new assignment.
- Its completion note (`ai-learning/implementation/completed/week-01-agent-or-workflow-decision-lab.md`) must remain intact as historical documentation, not be interpreted as a new task.
- Do not extend or repurpose the old lab for the internship project. If old lab links appear on the same Week 1 project pages and risk confusion, **flag a narrowly scoped separation fix for approval** rather than silently deleting existing functionality.

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

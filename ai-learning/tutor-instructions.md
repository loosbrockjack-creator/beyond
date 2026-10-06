# AI Learning Tutor Operating Instructions

This file defines the permanent commands used by the AI Learning Tutor.

The Tutor helps the learner understand the current AI curriculum. It should use the shared state in this repository rather than requiring the learner to upload weekly files manually.

## Shared sources

Before acting on a learning command, use the relevant files:

- `ai-learning/current-week.md`
- the current curriculum under `ai-learning/weeks/`
- `ai-learning/tutor-state/current.md`
- prior feedback under `ai-learning/feedback/` when useful

The Beyond application uses Supabase project:

`jlafnhtkygcukkbhwndy`

Do not change application code, quiz content, course order, gating, or unrelated database records when handling Tutor commands.

---

## Command: Sync learning state

When the learner says:

**Sync learning state**

Review the conversation since the last meaningful sync and update:

`ai-learning/tutor-state/current.md`

Keep only durable learning signals:

- concepts clearly understood
- meaningful misconceptions that were corrected
- concepts still unclear
- important realizations
- strategic questions
- implementation ideas worth preserving

Do not store:

- full transcripts
- every question asked
- filler
- temporary confusion that was immediately resolved

Preserve useful existing state and replace anything that is no longer accurate.

---

## Command: Generate weekly project

When the learner says:

**Generate weekly project**

Do not ask the learner to upload the curriculum or tutor-state files.

### 1. Read the learning context

Read:

1. `ai-learning/current-week.md`
2. the current week's curriculum file
3. `ai-learning/tutor-state/current.md`
4. the previous week's feedback if relevant

Use the curriculum to determine what the week is supposed to teach.

Use tutor-state to determine what the learner most needs to practice.

The project must still assess the central concepts of the week. Tutor-state should personalize the emphasis, not replace the week's learning objectives.

### 2. Check the current project slot

Query the Beyond Supabase project for the topic matching the current week.

Inspect:

- the topic
- any existing project for that topic
- whether a submission already exists for that project

If a real project already exists, do not overwrite it unless the learner explicitly asks to regenerate it.

If a submission already exists, never replace the project without explicit confirmation.

### 3. Design the project

The target budget is approximately 2 hours.

The project should:

- require genuine use of the week's core concept
- reinforce one or more weaknesses or unresolved questions from tutor-state
- build judgment and AI-direction skill rather than reward manual coding for its own sake
- be small enough to finish
- have one hard constraint that makes superficial completion impossible
- fit the existing Beyond course direction rather than becoming a random side project

Where useful, include learner checkpoints that require the learner to make a decision before delegating the next step to Claude.

Examples include:

- define success criteria before implementation
- choose between two proposed approaches and explain why
- define how the result should be verified
- diagnose a failure before asking Claude to fix it

Do not create artificial checkpoints merely to add friction.

### 4. Write the project into Beyond

Use the existing `projects` table for the current topic.

Set:

- `title`
- `brief`
- `hard_constraint`
- `spine_note`
- `est_hours`
- `is_placeholder = false`
- `generated_at`
- `generated_from`

Use `generated_from` to record that the project was generated from:

- the current curriculum
- tutor-state
- the current week number
- ChatGPT Tutor project generation

Do not create a second competing project record for the same topic.

### 5. Build the rubric

Use the existing five rubric labels, in this order:

1. Works end to end
2. Correct core mechanic
3. Handles failure
4. Readable
5. Documented

Each criterion is worth 20 points.

Write project-specific descriptions for each criterion, based on the generated brief.

Replace the rubric only when creating or explicitly regenerating that week's project.

### 6. Report back

After successfully writing the project, tell the learner:

- the project title
- the personalized learning emphasis
- the hard constraint
- that it is now available in Beyond

Keep this response concise.

---

## Command: Regenerate weekly project

When the learner says:

**Regenerate weekly project**

Follow the same process as Generate weekly project, but first verify whether a submission exists.

If a submission exists, ask for explicit confirmation before replacing the brief or rubric.

---

## Command: Implement this

When the learner says:

**Implement this**

This is separate from the required weekly project.

Turn the relevant learning insight into a scoped implementation brief or GitHub issue for Claude.

Include:

- concept
- why it matters
- requested task
- relevant learning context
- constraints
- success criteria

Do not treat "Implement this" as permission to regenerate the required weekly project.

---

## Core principle

The curriculum defines what must be learned.

Tutor-state determines where the learner needs reinforcement.

The weekly project combines both.

Claude may implement the project, but Claude should not be the system deciding what the learner needs to practice.

# AI Learning System

This folder is the shared state between the weekly research workflow, the ChatGPT tutor, and Claude.

## Roles

### ChatGPT Work: curriculum researcher

Use the installed AI Learning Curator skill in Work to research the next week.

The researcher should:
1. Ask for feedback from the previous week.
2. Revalidate the roadmap topic against the current state of AI.
3. Research current, high-quality material.
4. Produce about two hours of learning.
5. Favor clear explanatory material over developer-heavy documentation.
6. Save only the final curriculum, not the research dump.

Weekly curriculum files belong in:

`ai-learning/weeks/`

### ChatGPT tutor: learning and reflection

Use the normal tutoring chat while studying.

The tutor should:
- answer questions about the current material,
- identify durable misconceptions and insights,
- avoid saving full chat transcripts,
- update `ai-learning/tutor-state/current.md` when the user says "Sync learning state",
- create an implementation brief or GitHub issue when the user says "Implement this".

### Claude: implementation

Claude should treat the learning files as context, not as automatic work requests.

Claude should only implement when there is:
- an explicit implementation brief, or
- an explicit GitHub issue requesting implementation.

For learning-driven implementation work, Claude should read:
1. `ai-learning/current-week.md`
2. the linked weekly curriculum
3. `ai-learning/tutor-state/current.md`
4. the implementation brief or GitHub issue
5. the existing application code and project instructions

## Weekly loop

1. Run the AI Learning Curator in ChatGPT Work.
2. Save the final curriculum in `ai-learning/weeks/`.
3. Study the material.
4. Ask questions in the ChatGPT tutor.
5. Say "Sync learning state" when useful.
6. Say "Implement this" when a concept should be applied to Beyond.
7. Create a GitHub issue using the AI learning implementation template.
8. Claude investigates, implements, tests, and opens a PR.
9. Review Claude's result with the tutor and connect it back to the concept.
10. Feed that experience into the next week's feedback.

## Source of truth

GitHub is the persistent shared memory layer.

Do not use raw chat transcripts as shared state. Store only concise, durable learning signals and explicit implementation briefs.

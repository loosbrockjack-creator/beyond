@AGENTS.md

# Beyond

A personal 16 week course for learning to build with AI, structured like Canvas.
Four modules of four topics. One build project per week. A quiz per topic that must be
passed at 100% before the next topic opens.

Currently a **skeleton prototype**: the structure, navigation, design system, and the
quiz / gating / grading logic are all real. The quiz questions and project briefs are
placeholders, flagged with `is_placeholder` in the database.

## Running it

```bash
npm run dev          # http://localhost:3000
npm run build        # always run before calling a change done
```

Sign in with the Supabase account. Auth is email + password, single user.

## Design rules

These are not suggestions. They come from reference images in
`../../research/visual-reference/aesthetic/`, and every color was sampled from them.

- **One accent, used sparingly.** `#8CF2C7` mint, and nothing else. In the reference it
  appears on about three elements per screen. Accent is allowed on: the primary button,
  the active nav marker, a passing score, progress fill, and the logo mark. Never a
  surface, never a large area, never decoration.
- **No other hues.** There is deliberately no red and no amber. A failed quiz or an
  overdue project is signalled by weight and wording, not by turning something red.
  If you are about to add a color, don't. Ask first.
- **No em dashes.** Not in copy, not in comments. Use commas, periods, colons, or pipes.
- Matte black only. No gradients on surfaces. Hairline dividers, not cards; the four
  dashboard module tiles are the only cards in the app.
- Numerals are always mono and tabular (`.num`). Labels are always the wide-tracked
  uppercase `.label`.
- Product UI, so type uses a **fixed rem scale**, never fluid `clamp()`.

Tokens live in `src/app/globals.css` under `@theme`. Tailwind v4 is CSS-first, so there
is no `tailwind.config.ts`.

## Course order

Topics follow **the exact order of `active/research/base-instructions/What to Learn.md`**.
This is deliberate and was chosen over a dependency ordering. Do not "fix" it by moving
prerequisites earlier.

| Module | Slug | Weeks |
|---|---|---|
| Agent Core | `core` | 1-4: agents, agentic coding, tool calling, context engineering |
| Reach and Reliability | `reach` | 5-8: APIs, MCP, evals, computer-use |
| Knowledge and Boundaries | `knowledge` | 9-12: RAG, multimodal, memory, security |
| Structure and Economics | `structure` | 13-16: structured outputs, decomposition, routing, fine-tuning |

Module and topic order live entirely in the database (`modules.number`, `topics.number`,
`topics.week_number`). No slug is hardcoded anywhere in `src/`, so reordering is a data
migration and never a code change.

## Where the rules live

Three pure modules with no Supabase imports, so they stay testable and cannot drift:

- `src/lib/gating.ts` - what unlocks what. The only place this is expressed.
- `src/lib/gpa.ts` - score to letter to points, 4.0 scale.
- `src/lib/schedule.ts` - week to dates, including the holiday break.

`src/lib/course.ts` loads everything and derives every status. **Topic status is always
derived from quiz attempts**, never read from `topic_progress.status`. That table is
bookkeeping only, so it can never become a second source of truth that disagrees.

## Gotchas

- **Next 16 renamed `middleware` to `proxy`.** The auth check is `src/proxy.ts` and the
  exported function must be named `proxy`. A file called `middleware.ts` is deprecated.
- `params` is a Promise in every page and layout. Always `await params`.
- Quizzes are scored **server side only** (`src/lib/actions/quiz.ts`). The quiz page
  deliberately does not select `is_correct`.
- The AI grader needs `ANTHROPIC_API_KEY`. Without it, submissions save but come back
  with status `error`. It uses `claude-opus-5` with structured outputs.

## Database

Supabase project `beyond`, ref `jlafnhtkygcukkbhwndy`. Every table has RLS on.
Content tables are readable by any signed-in user; progress tables are scoped to
`auth.uid()`. See `supabase/README.md`.


## AI learning system

This repository includes a shared AI learning workflow under `ai-learning/`.

For any task created from the AI learning process, read and follow:
- `ai-learning/CLAUDE.md`
- `ai-learning/current-week.md`
- `ai-learning/tutor-state/current.md`
- the authoritative implementation source for the task

For required weekly projects, the authoritative project brief is the non-placeholder row in Supabase `projects` for the current week's topic, plus its `rubric_criteria`. Do not expect a separate project file in GitHub.

For optional learning implementations, use the explicit implementation brief or GitHub issue.

Learning files are context only. Do not change product behavior merely because an idea appears in the curriculum, feedback, or tutor state. Implementation requires either a generated weekly project in Supabase or an explicit implementation brief / GitHub issue.

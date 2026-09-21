# Database

Supabase project `beyond`, ref `jlafnhtkygcukkbhwndy`, region us-east-2.

## Migrations

Applied in this order. They live in Supabase's migration history rather than in this
folder; run `npx supabase link --project-ref jlafnhtkygcukkbhwndy && npx supabase db pull`
to materialise them here as files.

| Version | Name |
|---|---|
| 20260920224812 | content_schema |
| 20260920224823 | progress_schema |
| 20260920224835 | row_level_security |
| 20260920224939 | seed_modules_and_topics |
| 20260920225000 | seed_quizzes_projects_rubrics |
| 20260920225018 | seed_tools |
| 20260921020251 | index_foreign_keys |

## Shape

**Content** (seeded, read-only through the app): `modules`, `topics`, `quizzes`,
`quiz_questions`, `quiz_options`, `projects`, `rubric_criteria`, `tools`, `tool_topics`.

**Progress** (per user, keyed to `auth.uid()`): `course`, `topic_progress`,
`quiz_attempts`, `submissions`, `rubric_scores`, `resources`.

## RLS

Every table has row level security enabled. Content tables allow `select` to
`authenticated`. Progress tables use `(select auth.uid()) = user_id`. `rubric_scores`
inherits ownership through its parent submission.

## Seeded state

The single user opens mid-course on purpose, so every UI state is visible at once:
topics 1 to 5 complete and graded, topic 6 in progress with one failed attempt,
topics 7 to 16 locked. `course.start_date` is a column, not a constant, so resetting
for real is a one row update.

Regenerate types after any migration:

```bash
npx supabase gen types typescript --project-id jlafnhtkygcukkbhwndy > src/lib/supabase/types.ts
```

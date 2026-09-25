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

## Week 1 content (seeded 2026-09-24)

Week 1 (Agents and Agentic Systems) is populated from the nine sources Jack
supplied, recorded verbatim in `seed/week-01-sources.txt` with tracking params
stripped in the database.

| Migration | What |
|---|---|
| seed_week1_sessions | 9 sessions, one per source, plus recalls for sessions 1-4 |
| seed_week1_recall_options | Answer options for those recalls |
| seed_week1_quiz_pool | Weekly quiz plus 8 pooled questions |
| seed_week1_recalls_5_to_9 | Recalls for sessions 5, 6, 8, 9 |
| seed_week1_quiz_pool_part2 | 8 more pooled questions, covering the back half |

24 recall questions across 8 sessions, 3 options each, exactly one correct.
7 of them are carried forward from the previous session for delayed retrieval.
16 pooled weekly-quiz questions tagged by session; an attempt samples 5,
weighted toward whatever was recalled worst.

Session 7 is a YouTube talk and has no recall, so it offers "Mark as read"
instead. Questions were written against the fetched text of each source rather
than from memory; the video could not be read, so none were invented for it.

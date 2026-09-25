-- Scaffold for adding real content to a topic.
--
-- The placeholder content was deleted on 2026-09-24. This file is the shape to
-- follow when writing a real week, and the rubric below is the one that was in
-- use, kept because it applies to any build project.
--
-- Replace :slug with the topic slug, then run one week at a time.

-- 1. The quiz. pass_threshold stays 100: it is a gate, not an assessment.
insert into quizzes (topic_id, title, pass_threshold)
select id, title || ' Check', 100 from topics where slug = :'slug';

-- 2. Questions. Set is_placeholder false once they are real.
--    Best format for this material: show an agent loop with a subtle flaw and
--    ask what breaks on which iteration. Tests judgement, not recall.
insert into quiz_questions (quiz_id, order_index, prompt, explanation, is_placeholder)
select q.id, 1, 'Real question text', 'Why the right answer is right, and why the near miss is wrong.', false
from quizzes q join topics t on t.id = q.topic_id where t.slug = :'slug';

-- 3. Options. Exactly one is_correct per question.
insert into quiz_options (question_id, order_index, label, is_correct)
select qq.id, 1, 'Option text', true
from quiz_questions qq join quizzes q on q.id = qq.quiz_id
join topics t on t.id = q.topic_id where t.slug = :'slug' and qq.order_index = 1;

-- 4. The build project. A good brief has a specific failure mode built in, so
--    it cannot be completed without the week's concept.
insert into projects (topic_id, title, brief, is_placeholder)
select id, 'Project title', 'What to build, and the constraint that forces the concept.', false
from topics where slug = :'slug';

-- 5. The rubric. Generic on purpose: it applies to any build project and sums
--    to 100. This is what the AI grader scores against.
insert into rubric_criteria (project_id, order_index, label, description, max_points)
select p.id, r.i, r.label, r.description, 20
from projects p join topics t on t.id = p.topic_id
cross join (values
  (1,'Works end to end','Runs from a clean clone and does what the brief asks, without manual patching.'),
  (2,'Correct core mechanic','The specific technique this week targets is genuinely implemented, not faked or stubbed.'),
  (3,'Handles failure','Errors, timeouts and bad input are handled deliberately rather than swallowed or ignored.'),
  (4,'Readable','A stranger could follow it. No dead code, no leftover scaffolding, no mystery names.'),
  (5,'Documented','A README that explains the decisions and the tradeoffs, not just the install commands.')
) as r(i, label, description)
where t.slug = :'slug';


-- ============================================================================
-- SESSIONS
-- A week is subdivided into sessions: one source to read, then a three question
-- recall. Sessions have no deadline. Only the weekly quiz and project do.
-- ============================================================================

-- 6. One session per source. order_index communicates the intended reading
--    order but does not enforce it; every session is open from the start.
insert into sessions (topic_id, order_index, title, source_url, source_kind, est_minutes, note)
select id, 1, 'Title of the piece', 'https://...', 'article', 15,
       'Why this one, and what to watch for while reading.'
from topics where slug = :'slug';

-- 7. Three recall questions per session. Set carried_from_session_id to the
--    PREVIOUS session's id on one of them: delayed retrieval is what actually
--    builds retention, immediate recall is only a comprehension check.
insert into recall_questions (session_id, order_index, prompt, explanation, carried_from_session_id)
select s.id, 1, 'Question about what was just read', 'Why the right answer is right.', null
from sessions s join topics t on t.id = s.topic_id
where t.slug = :'slug' and s.order_index = 1;

insert into recall_options (question_id, order_index, label, is_correct)
select rq.id, 1, 'Option text', true
from recall_questions rq join sessions s on s.id = rq.session_id
join topics t on t.id = s.topic_id
where t.slug = :'slug' and s.order_index = 1 and rq.order_index = 1;

-- 8. Weekly quiz questions are tagged with the session they came from, so an
--    attempt can be weighted toward whatever was recalled worst. Write more
--    than five: each attempt samples five from the pool.
--    (Add session_id to the quiz_questions insert in step 2 above.)

# Week 1 Project: AI Internship Intelligence Agent

**Status:** Approved project scope. Implementation plan still requires learner approval.
**Learning week:** Week 1, Agents and Agentic Systems.
**Build week:** The learner is alternating learning weeks with project weeks.
**Time budget:** Approximately 2 hours total for an initial working prototype.
**Source:** Week 1 Tutor conversation and `ai-learning/tutor-state/current.md`.
**GitHub project brief:** `ai-learning/projects/week-01-internship-intelligence-agent.md`.

## Active project identity and historical boundary

THIS is the new active Week 1 project, replacing the prior **Agent or Workflow? Decision Lab** assignment. The old assignment was implemented in Beyond and documented at
`ai-learning/implementation/completed/week-01-agent-or-workflow-decision-lab.md`.
That file records completed historical work; it is **not** an implementation instruction for this project.
Do not reuse the old assignment, its question content, or its app route as the internship agent.
Do not delete the historical completion note or modify unrelated course content.
This agent should initially run as a **standalone prototype in its own directory within the repository**, not as a replacement for the Beyond quiz/lab and not as a new full dashboard.

The active Week 1 entry in the Beyond Supabase `projects` table should point to this exact GitHub brief in `generated_from.repo_brief`. If the Supabase row and this file materially disagree, pause and ask before implementing.

## Goal

Build a small, usable AI Internship Intelligence Agent that searches for **real, currently open Summer 2027 internships**, checks fit against the learner's background, and returns a prioritized shortlist with evidence.

Learner background:
- Sophomore at Iowa State University.
- Double-majoring in Finance and Entrepreneurship.
- Interests: finance, corporate strategy, business analytics and nearby fields.
- Minneapolis area preferred; relocation elsewhere in the U.S. is possible.
- Existing business and sales experience is relevant context, but do not invent additional qualifications.
- Do not assume exact graduation date, work authorization, or preferences that have not been supplied.

## Why this applies Week 1 learning

This is a practical exercise in choosing between fixed workflows and agent autonomy:
- A fixed workflow is enough for routine formatting and deterministic filtering.
- A narrowly scoped agent loop is useful when search results are incomplete and the system must choose what information to investigate next.
- Identify the **model** (reasoning), **harness** (tool/decision loop, guards and stops), **tools** (approved job search and source inspection), and **environment** (where the prototype runs).
- Prioritize source quality, evidence, and explicit stopping conditions over unnecessary multi-agent or infrastructure complexity.

## Must-have scope (two-hour MVP)

1. On-demand execution from a simple command or minimal local interface. No full dashboard.
2. Real job discovery through an accessible, legitimate provider or search tool, using live source links. Do not manufacture jobs, links, opening dates, or eligibility.
3. Basic screening for relevance to finance/strategy/analytics, Summer 2027, location, and available eligibility requirements. Mark missing or ambiguous requirements **unverified**; do not silently mark eligible.
4. Transparent rank ordering using a small set of weights approved by the learner (e.g. relevance, evidence of eligibility, location preference, personal experience fit). Explain *why* each opportunity ranks where it does.
5. A short, usable shortlist, ideally 3 to 5 verified-source opportunities when enough exist; if fewer are found, report honestly rather than padding. Each row should provide employer, role, location, source/apply URL, eligibility status, fit explanation, and last-checked date.
6. **One genuine agent decision** visible in a trace: after seeing retrieved information, the agent chooses a relevant follow-up action (e.g. inspect a specific posting to check graduation eligibility). The chosen action cannot be a hardcoded step performed identically for every result.
7. A clear stop condition and a limit on search/tool calls so it doesn't run indefinitely.

## Explicitly out of scope

- Automatic applications or contacting recruiters.
- Tailored resume modifications or uploading a resume.
- Application tracking dashboard and persistent history/database.
- Recurring scheduled searches or notifications.
- Multiple specialist subagents, complex memory, compaction, or production deployment.
- Scraping sites that require login or bypassing terms/technical restrictions.

These can be assessed in a later iteration.

## Hard constraint

**The project must demonstrate an observable, evidence-based next-step decision made by the agent after reading a real search result.** Merely piping a fixed search into a fixed ranking script does not fulfill the Week 1 agent concept. Do not claim the agent made a dynamic decision if it did not.

## Learner checkpoints (human decisions, not delegated to Claude)

1. **Requirements checkpoint:** Before code, ask the learner to confirm a simple ranking priority order / weights, nonnegotiable exclusions, and any necessary eligibility assumptions such as graduation timing. Avoid a long questionnaire; offer sensible choices.
2. **Architecture checkpoint:** Inspect existing code and the available live job-data/search options. Show the smallest proposed architecture, explicit tools, expected limitations, and evidence checks. **Wait for learner approval before implementing code.**
3. **Verification checkpoint:** After implementation, the learner personally checks source links, eligibility labels, rankings, and one decision trace. Capture observed successes/failures and request corrections based on evidence.

## Acceptance criteria (learner verifies)

1. An on-demand run attempts a real search through an identified provider/tool and includes source URLs. If the provider is blocked, the result must explicitly report that blocker and **not** present synthetic postings as live.
2. The shortlist contains no invented job postings, eligibility facts, dates, or links. Unknown graduation requirements are marked unverified. Closed or stale listings are not silently called open.
3. At least one recorded decision reflects an actual retrieved result that led to a targeted follow-up action; the agent does not always execute the same predefined fixed sequence.
4. Rankings can be explained from the learner-approved criteria and reasonable evidence, rather than arbitrary unexplained scores.
5. Output is readable without a dashboard and gives employer, role, location, link, evidence-based eligibility, reason to prioritize, and checked timestamp.
6. The prototype has a bounded execution path and an honest failure mode when the job source is unreachable, yields no relevant roles, or a posting lacks eligibility details.
7. Claude provides a short handoff describing what was built, what was actually tested, any unverified behavior, and one follow-up improvement.

## Implementation guidance to Claude Code

- First read `CLAUDE.md`, `ai-learning/CLAUDE.md`, this brief, and `ai-learning/tutor-state/current.md`.
- Treat this file as **the approved Week 1 project** even though `ai-learning/current-week.md` currently names Week 2. Do not implement the Week 2 assignment.
- Check accessible job-search tools before selecting an architecture. A coding harness's own browsing capability is not automatically a tool usable by the finished custom agent.
- Prefer an isolated directory such as `experiments/internship-intelligence/` (or a clearer path based on repo structure). Avoid unrelated Beyond application changes.
- Keep credentials server-side and never commit API keys.
- If no reliable live job-source integration can be completed within the timebox, report a blocker or propose a user-approved revised MVP. Do not quietly replace live search with mock data.
- Before coding, present your architecture and acceptance-check plan, then wait for approval.
- Do not change quiz content, grading/gating, the course schedule, or existing Week 1 lab code. Existing links presenting the old lab as part of the new assignment should be flagged for a separate, narrowly scoped cleanup proposal rather than changed silently.
- After implementation, run appropriate tests and `npm run build` if touching the Beyond app, then add a **new** completion note named for the internship intelligence agent under `ai-learning/implementation/completed/`.

## Source of truth

For this project, use this GitHub brief for detailed requirements, and the single active Week 1 Supabase `projects` row plus its rubric as the app-facing mirror. A historical completion note for the old lab is not an active project brief. Never fall back to it.

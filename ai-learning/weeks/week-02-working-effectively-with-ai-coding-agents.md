# Week 02: Working effectively with AI coding agents

## Why this week matters

As agents handle more implementation, your advantage comes from choosing useful problems, defining success, supplying relevant information, and judging results. This week builds those skills through selected explanations and one small practice build. The roadmap topic remains valuable as of October 4, 2026.

## This week's outcome

Direct a coding agent from a clear brief through a verified result, recognize why work goes off track, and explain which decisions still require your judgment.

## Block 1: Delegate outcomes and reassess old habits

**Time:** 25 min  
**Objective:** Set useful boundaries while giving a capable agent room to solve the problem.

**Resource:** [Boris Cherny: We Cut 80% of Claude Code's Prompt, Y Combinator](https://www.youtube.com/watch?v=qyPCVqFUyDo)  
**Type:** Video  
**Published/updated:** July 27, 2026.

**Use it like this:**

- Watch only **03:21–10:30** and **14:26–21:57**, about 15 minutes. Skip the remaining chapters.
- Spend 10 minutes distinguishing an outcome, a constraint, a success check, and an unnecessary instruction about implementation.
- Use a Beyond example: “Help me know what to study next.” Define the user benefit and observable success before suggesting how to build it.
- Treat the speaker's examples as demonstrations, not a guarantee that your task will succeed.

**Why it matters:** Better models can make yesterday's elaborate instructions unnecessary. You need a habit of testing capability and adapting how you delegate.

**Finish able to explain:**

- How does a clear brief differ from micromanaging every step?
- How would you decide whether an old instruction still helps?

## Block 2: Turn a vague request into a usable brief

**Time:** 20 min  
**Objective:** Describe the result precisely enough that an agent can make sensible implementation decisions.

**Resource:** [Best practices for Claude Code, Anthropic](https://code.claude.com/docs/en/best-practices)  
**Type:** Guide  
**Published/updated:** Date not displayed; current live guide checked October 4, 2026.

**Use it like this:**

- Read **“Explore first, then plan, then code,” “Provide specific context in your prompts,”** and **“Let Claude interview you.”** Skip commands and configuration.
- Spend roughly 8 minutes reading and 12 writing a brief for the practice checklist in Block 5.
- Include: intended user and benefit, required behavior, relevant references, constraints, acceptance checks, and unresolved questions.
- Ask your tutor or coding agent to identify the most consequential ambiguity. Resolve it before implementation.

**Why it matters:** A precise brief helps the agent solve the right problem. Planning deserves more attention when the approach or scope is uncertain.

**Finish able to explain:**

- What information belongs in the brief?
- When would planning add value, and when would it add overhead?

## Block 3: Keep work coherent across sessions

**Time:** 20 min  
**Objective:** Understand how useful project state survives beyond one conversation.

**Resource:** [Effective harnesses for long-running agents, Anthropic](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)  
**Type:** Article  
**Published/updated:** November 26, 2025.

**Use it like this:**

- Read the introduction, **“The long-running agent problem,” “Feature list,” “Incremental progress,”** and **“Getting up to speed.”**
- Skip the SDK links, code snippets, “Testing,” and “Future work.” Focus on requirements, progress, and handoffs.
- Budget 10 minutes to read and 10 to sketch a handoff containing: goal, current state, decisions, evidence, and next step.
- Apply it to the setup you already have: explain the different jobs of the weekly curriculum, current-week pointer, tutor state, and implementation brief.
- Treat the article's specific session structure as one experiment. Keep the underlying lesson about explicit state; reconsider the scaffolding as models improve.

**Why it matters:** A future session needs a reliable account of the work, especially when the original conversation is unavailable.

**Finish able to explain:**

- What should a fresh agent know before continuing?
- How do you distinguish a requirement, completed work, and an untested assumption?

## Block 4: Judge results and diagnose failures

**Time:** 25 min  
**Objective:** Define meaningful evidence of quality and use failures to improve the next attempt.

**Resource:** [Harness design for long-running application development, Anthropic](https://www.anthropic.com/engineering/harness-design-long-running-apps)  
**Type:** Article  
**Published/updated:** March 24, 2026.

**Use it like this:**

- Read **“Why naive implementations fall short,” “Frontend design: making subjective quality gradable,” “The architecture,”** and **“Removing the sprint construct.”** Also read the preceding section on simplifying the harness.
- Skip code, embedded demos, detailed result comparisons, cost tables, and the appendix. Budget 15 minutes.
- Spend 10 minutes writing three checks for the Block 5 checklist: one for behavior, one for usability, and one for a failure or edge case.
- If a check fails, describe expected versus actual behavior, reproduction steps, and available evidence. Have the agent investigate before proposing another fix.

**Why it matters:** Separate evaluation can catch omissions, but another agent's approval still needs evidence. Clear quality criteria and your own product judgment remain valuable.

**Finish able to explain:**

- Why might an impressive-looking app still fail its main task?
- When is independent review worth its additional cost?
- How would you distinguish missing context, a vague requirement, and an implementation bug?

## Block 5: Run a small build-and-verification loop

**Time:** 30 min  
**Objective:** Practice specifying, delegating, checking, and correcting one bounded task.

**Resource:** [Verification guidance from Anthropic](https://code.claude.com/docs/en/best-practices#give-claude-a-way-to-verify-its-work)  
**Type:** Guide + original practice exercise  
**Published/updated:** Guide date not displayed; exercise created October 4, 2026.

**Use it like this:**

- **3 minutes:** Read only the opening verification section, focusing on checks and evidence.
- **3 minutes:** Finalize your brief from Block 2.
- **8 minutes:** Give it to Claude Code or Codex in a separate practice folder and let it build the smallest usable prototype.
- **10 minutes:** Open the result, run your acceptance checks, and request one focused correction if needed.
- **6 minutes:** Write a short handoff and answer the week completion check below. If unfinished, record the failed check and next step within this time budget.

**Practice task:**

Create a standalone local HTML prototype of a Week 2 learning checklist, inspired by Beyond. Use a matte black background, restrained mint accent, and clear text labels. It should open directly in a browser without installation.

Required behavior:

- Show the five block titles from this curriculum with labeled checkboxes.
- Show an accurate completed count out of five.
- Preserve completion after refreshing the page.
- Provide a reset action that clears completion.
- Support toggling the checkboxes with the keyboard.

Acceptance checks:

1. A fresh checklist shows 0/5; checking one shows 1/5; unchecking it restores 0/5.
2. Checking all five shows 5/5, which remains after refresh.
3. Reset restores 0/5, which remains after refresh.
4. Keyboard interaction changes both checkbox state and the count.

Keep the prototype separate from the Beyond application. This exercise is a practice build; applying it to the product later requires its own implementation brief.

Ask the agent for observed check results and the location of the output. If it cannot run a browser check, record that as unverified and perform it yourself.

**Why it matters:** You experience the full loop while keeping the task small enough to inspect personally.

**Finish able to explain:**

- Which checks did the result actually pass, and what evidence supports that?
- What did you need to decide or correct yourself?

## Week completion check

Answer aloud or in your tutor chat. Short answers are enough; use the final six minutes of Block 5.

1. What are the essential parts of a coding-agent brief?
2. How can you give an agent autonomy while keeping success precise?
3. When should it inspect and plan before implementing?
4. What context should it retrieve, and what should persist between sessions?
5. Why can a successful build or an agent's “done” message be insufficient?
6. What evidence would you provide when a feature fails?
7. When does another reviewing agent help, and what can it still miss?
8. As agents improve, which human decisions become more valuable?

## Total time

Approx. **120 minutes**: 25 + 20 + 20 + 25 + 30.

Each block includes its reading or viewing and its exercise. The completion check is included in Block 5.

## Source selection note

Researched and checked October 4, 2026. The dated selections are from July 2026, March 2026, and November 2025, all within the preceding 12 months. The undated Anthropic guide was checked live and only its explanatory sections are assigned. Four distinct resources serve five blocks; the guide is reused for separate lessons. The November article teaches continuity of project state, while the newer material shows why model-specific scaffolding should be re-evaluated. Exercises and acceptance checks are original curriculum activities.

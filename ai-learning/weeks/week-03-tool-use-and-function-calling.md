# Week 03 | Tool Use and Function Calling

## Why this week matters

Tools let an AI system retrieve information and perform operations in other software. Understanding the boundary between a model's request and an executed action helps you direct agents and diagnose failures. This topic remains valuable for your internship agent, ClubMatch, and business research workflows.

## This week's outcome

Explain a tool call from request to verified result, judge whether a tool is well designed, and recognize when tool discovery or code-based orchestration helps.

This is Topic 3 in the roadmap. The numbering tracks learning topics; continue alternating learning and project weeks at your preferred pace. No build or installation is required this week.

## Time budget | checked against the assigned text

Reading estimates use **200 words per minute as a planning assumption**, not a measured personal reading speed. Counts are approximate, calculated from the rendered text in the assigned sections, excluding navigation and skipped code. Diagrams, technical notation, and rereading need additional time.

| Block | Assigned words | Reading at 200 wpm, rounded up | Pauses, rereading, and explanation | Total |
| --- | ---: | ---: | ---: | ---: |
| 1 | How tool calls work | ~1,240 | 7 min | 18 min | 25 min |
| 2 | What makes a tool useful | ~1,440 | 8 min | 22 min | 30 min |
| 3 | Scaling tool use | ~2,050 | 11 min | 19 min | 30 min |
| 4 | Internship-agent walkthrough | No external reading | | | 20 min | 20 min |
| Completion check | No external reading | | | 10 min | 10 min |
| **Total** | **~4,730** | **26 min rounded by block** | **89 min** | **115 min** |

The combined unrounded reading estimate is approximately 24 minutes. At 150 wpm it is approximately 32 minutes. Neither estimate includes comprehension time; the larger block allowances do. Keep a timer for each block and record actual time. If a section is still confusing at its time limit, note the question and move on rather than following additional links. Breaks are outside the 115-minute total.

## Block 1 | How a model actually uses a tool

**Time:** 25 min  
**Objective:** Distinguish choosing an operation from executing it.

**Resource:** [How tool use works | Anthropic](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)  
**Type:** Documentation  
**Published/updated:** No publication or update date displayed; live page checked November 8, 2026.

**Use it like this:**

- Read from **“The tool-use contract”** through the end of the comparison table immediately before **“Next steps.”** Approximately 1,240 words.
- Do not follow linked implementation guides. Understand the numbered loop conceptually; memorizing API field names is unnecessary.
- Budget 15 minutes for reading and pauses, then 10 minutes to explain a weather lookup aloud: request, selected tool, inputs, execution, returned result, final answer.

**Why it matters:** You can locate whether a failure happened in model selection, application execution, or interpretation of the result.

**Finish able to explain:**

- Who runs a client tool, and who runs a server tool?
- What separates a requested action from evidence that it completed?
- When does a task need external tools?

Learning clarification: a schema describes the required input structure. Correctly shaped input does not prove that the chosen city, person, or record is correct. A tool call is also unnecessary merely to summarize text already supplied to the model.

## Block 2 | What makes a tool useful to an agent

**Time:** 30 min  
**Objective:** Assess tool boundaries, descriptions, and returned information.

**Resource:** [Writing effective tools for agents | with agents](https://www.anthropic.com/research/writing-tools-for-agents)  
**Type:** Article  
**Published/updated:** September 11, 2025. **Older but still durable:** its design principles remain consistent with the current tool-use documentation checked for this curriculum.

**Use it like this:**

- Read only **“Principles for writing effective tools,”** stopping before **“Looking ahead.”** Approximately 1,440 words. Skip the code and code screenshots; inspect diagrams only if helpful.
- Skip the introductory implementation and evaluation walkthroughs.
- Spend 20 minutes reading and pausing, then 10 minutes rewriting an imaginary `find_jobs` tool description. Specify when to use it, required inputs, returned fields, limitations, and what happens when there are no matches. Use plain English.

**Why it matters:** Better tool interfaces help agents select relevant operations and use their results efficiently.

**Finish able to explain:**

- Why can several overlapping tools be harder to use than a smaller, clearer set?
- What should a job-search result include for your next decision?
- How would an actionable error help an agent recover?

## Block 3 | Tool discovery, orchestration, and examples

**Time:** 30 min  
**Objective:** Recognize three different tool-use bottlenecks and their possible remedies.

**Resource:** [Introducing advanced tool use on the Claude Developer Platform](https://www.anthropic.com/research/advanced-tool-use)  
**Type:** Article  
**Published/updated:** November 24, 2025. Read the concepts; use current documentation for any future implementation.

**Use it like this:**

Read these selections in order, totaling approximately 2,050 words:

1. The opening prose before **“Tool Search Tool.”**
2. The tool-search section through its explanation of caching. Skip both implementation code examples and their bridging implementation prose. Resume at the subsection about when to use tool search and finish that section.
3. The start of **“Programmatic Tool Calling”** through the business budget example's explanation before its Python code. Skip that code. Read the explanation and benefits immediately after it, stopping before the implementation walkthrough. Then jump to the subsection about when to use this approach.
4. The introductory prose under **“Tool Use Examples.”** Skip the first schema code block, read the ambiguity discussion and solution paragraph, skip the example-call code block, then read the interpretation and use cases after it.
5. Under **“Best practices,”** read only its opening and first subsection about layering features. Stop before the configuration guidance.

Spend 20 minutes reading and pausing, then 10 minutes matching each bottleneck to a remedy: too many tool definitions, excessive intermediate data, or ambiguous inputs. Skip launch-era model names, setup instructions, and performance numbers; do not memorize them.

**Why it matters:** You can choose a targeted architectural improvement when tool use becomes cumbersome.

**Finish able to explain:**

- How is discovering a tool different from calling it?
- Why might code process intermediate results before the model sees them?
- Why can examples help even when an input schema already exists?

## Block 4 | Walk through your internship agent

**Time:** 20 min  
**Objective:** Apply the reading to a familiar task without building a separate project.

**Resource:** [Your own notes from Blocks 1–3](#block-1--how-a-model-actually-uses-a-tool)  
**Type:** Other | guided walkthrough  
**Published/updated:** Prepared November 8, 2026.

**Use it like this:**

Use this hypothetical request: “Find three Summer 2027 finance internships near Minneapolis that accept sophomores, compare them with my resume, and save suitable roles to my tracker.” Do not actually run searches or change a tracker for this exercise.

- **5 min:** Identify the needed operations. Separate external retrieval and saving from judgments such as evaluating fit. List which inputs are missing.
- **5 min:** Follow one imagined role through the process. Name the information each step needs and the evidence each step should return. Mark any step that must wait for an earlier result.
- **5 min:** Explain recovery for an expired posting, unclear class eligibility, and a tracker save that times out. For the timeout, consider checking whether the row exists before retrying.
- **5 min:** Explain how you would verify the final result. Include posting evidence, unresolved eligibility questions, and whether the tracker actually contains the intended role.

**Why it matters:** You practice specifying observable behavior and diagnosing failures in an agent you would use.

**Finish able to explain:**

- Which steps require tools, and which require judgment?
- Which lookups can happen independently?
- What evidence would justify reporting that a role was saved?

## Week completion check

**Time:** 10 min. Answer briefly from memory; use any remaining time to revisit your weakest answer.

1. What is a tool call, in plain English?
2. Who executes it, and how does the model receive its result?
3. How can a structurally valid call still be wrong?
4. What information belongs in a useful tool description?
5. How do you keep tool results useful without returning everything?
6. When would tool search help, and when might it add needless overhead?
7. When would code-based orchestration help?
8. What should an agent do when a required input is unknown?
9. How do you distinguish a failed operation from an operation whose outcome is unknown?
10. What evidence supports a claim that an external action succeeded?

Record your actual reading and total times, plus the section that slowed you down most. Use those observations to calibrate the next topic. The pacing feedback for this week was that the previous curriculum took much longer than expected, so reading volume and comprehension time are budgeted separately here.

## Total time

**Approximately 115 minutes**, excluding breaks. Four blocks plus the completion check. No optional links, installation, API coding, or full project are included in that estimate.

## Source selection note

Live research checked the topic against current official documentation and explanatory engineering material. The September 2025 article is older but still durable because its tool-design guidance aligns with the current documentation. The November 2025 article supplies a conceptual explanation of scaling tool use; its launch-era configuration is deliberately excluded. All assigned pages were directly retrievable during research. Three sources are sufficient here; the selections avoid a full developer tutorial and repeated introductory material.
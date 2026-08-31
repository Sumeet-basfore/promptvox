Read `context/project-overview.md` for the prompt structure before
starting.

Implement the template engine in `packages/core/prompt/templates.ts`.

## Implementation

Define one Markdown template per `TaskType`, each with these sections:

- `## Goal`
- `## Context`
- `## Acceptance Criteria`
- `## Constraints`
- `## Out of Scope`

Write `fillTemplate(taskType: TaskType, transcript: string, llm: LLMProvider): Promise<GeneratedPrompt>` that:

- sends the transcript and the target template's section list to the
  LLM with an instruction to fill each section from the transcript,
  leaving a section as `_Not specified._` if the transcript gives no
  information for it — never invent specifics the user didn't say
- assembles the final Markdown from the returned section content
- returns a `GeneratedPrompt` with the filled markdown, the task type,
  and the original transcript

## Scope Limits

- Templates are fixed for v1 — no user-defined/custom templates yet.
- Do not wire this to the classifier or capture flow in this unit —
  that happens in the pipeline unit.

## Check When Done

- Given a transcript and a task type, `fillTemplate()` returns
  well-formed Markdown with all five sections present.
- A transcript missing information for a section produces
  `_Not specified._` in that section rather than fabricated content.

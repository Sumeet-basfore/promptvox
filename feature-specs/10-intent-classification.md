Read `context/project-overview.md` for the task type definitions before
starting.

Implement the intent classifier in `packages/core/prompt/classify.ts`.

## Implementation

- Write `classify(transcript: string, llm: LLMProvider): Promise<ClassificationResult>`.
- Build a single classification prompt that asks the LLM to return one
  of the five `TaskType` values plus a confidence score, in a strict,
  parseable format (e.g. a small JSON object).
- Parse the LLM response defensively: if it does not match the expected
  shape, retry once with a stricter instruction; if it still fails, fall
  back to `taskType: "other"` with `confidence: 0` rather than throwing.
- This function must work identically regardless of whether `llm` is the
  local or cloud provider — it only depends on the `LLMProvider`
  interface.

## Scope Limits

- Do not generate the final prompt in this unit — classification only.
- Do not add a UI for reviewing/correcting the classification yet.

## Check When Done

- Given sample transcripts for each task type, `classify()` returns the
  expected type in the common case.
- A malformed LLM response never throws out of `classify()` — it
  degrades to `"other"` with `confidence: 0`.

Read `packages/core/prompt/classify.ts` and
`packages/core/prompt/templates.ts` before starting.

Wire the end-to-end pipeline in `packages/core/prompt/pipeline.ts`.

## Implementation

Write `generatePrompt(audio: Blob | ArrayBuffer, stt: STTProvider, llm: LLMProvider): Promise<{ transcript: string; result: GeneratedPrompt }>` that:

1. calls `stt.transcribe(audio)`
2. calls `classify(transcript, llm)`
3. calls `fillTemplate(classification.taskType, transcript, llm)`
4. returns both the raw transcript and the final `GeneratedPrompt`

This is the single entry point both apps call — neither app talks to
`STTProvider`, the classifier, or the template engine directly.

Add a typed `PipelineError` that wraps and identifies which stage
(transcription, classification, generation) failed, so the UI can show
a stage-specific error message.

## Scope Limits

- No history persistence here — the caller decides whether/how to save
  the result.
- No UI in this unit.

## Check When Done

- Given a sample audio clip and any valid STT + LLM provider pair, the
  pipeline returns a transcript and a filled `GeneratedPrompt`.
- A failure at any stage surfaces a `PipelineError` identifying that
  stage, not a generic/unlabeled error.

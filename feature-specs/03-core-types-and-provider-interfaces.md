Read `context/architecture-context.md` before starting.

Define the shared types and provider interfaces that every later unit
builds against. No implementations yet.

## Implementation

In `packages/core/types.ts`, define:

- `TaskType` — union: `"feature" | "bug" | "refactor" | "question" | "other"`.
- `TranscriptionResult` — `{ text: string; durationMs: number }`.
- `ClassificationResult` — `{ taskType: TaskType; confidence: number }`.
- `GeneratedPrompt` — `{ taskType: TaskType; markdown: string; sourceTranscript: string }`.
- `HistoryEntry` — `{ id: string; createdAt: string; transcript: string; prompt: GeneratedPrompt }`.

In `packages/core/providers/stt/types.ts`, define:

- `STTProvider` interface with `transcribe(audio: Blob | ArrayBuffer): Promise<TranscriptionResult>` and a `readonly kind: "local" | "cloud"`.

In `packages/core/providers/llm/types.ts`, define:

- `LLMProvider` interface with `complete(prompt: string): Promise<string>` and a `readonly kind: "local" | "cloud"`.

In `packages/core/storage/types.ts`, define:

- `SettingsRepository` interface: `get(): Promise<Settings>`, `set(settings: Settings): Promise<void>`.
- `HistoryRepository` interface: `list(): Promise<HistoryEntry[]>`, `add(entry: HistoryEntry): Promise<void>`, `remove(id: string): Promise<void>`, `clear(): Promise<void>`.
- `Settings` type covering: selected STT provider + its config, selected LLM provider + its config.

## Scope Limits

- Types and interfaces only — no concrete provider or repository
  implementations in this unit.
- Do not add UI code in this unit.

## Check When Done

- `packages/core` builds with strict mode and no `any`.
- All interfaces above exist and are exported from `packages/core`.

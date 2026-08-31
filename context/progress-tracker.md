# Progress Tracker

Update this file whenever the current phase, active feature, or
implementation state changes.

## Current Phase

- Feature Spec 04 (Settings & History Storage Repositories) - Complete

## Current Goal

- Implement Feature Spec 05 (Cloud STT Provider).

## Completed

- Feature Spec 01: Scaffolded pnpm monorepo with `@promptvox/core`, `@promptvox/ui`, `apps/extension` (WXT Manifest V3), and `apps/desktop` (Tauri 2). Verified root `pnpm install`, TypeScript compilation, WXT extension build, and Tauri desktop frontend/backend checks.
- Feature Spec 02: Built shared design system in `@promptvox/ui` with Catppuccin Mocha CSS custom properties, shadcn UI components (`Button`, `Card`, `Dialog`, `Input`, `Textarea`, `Tabs`, `Switch`, `ScrollArea`), Tailwind utilities (`cn`), and pulsing `RecordingIndicator` component.
- Feature Spec 03: Defined core domain types (`TaskType`, `TranscriptionResult`, `ClassificationResult`, `GeneratedPrompt`, `HistoryEntry`) and provider/storage interfaces (`STTProvider`, `LLMProvider`, `SettingsRepository`, `HistoryRepository`, `Settings`, `STTConfig`, `LLMConfig`) in `@promptvox/core`.
- Feature Spec 04: Implemented persistent storage foundation per `feature-specs/04-settings-storage.md`:
  - `packages/core`: Added `DEFAULT_SETTINGS`, boundary validation (`validateSettings`, `validateHistoryEntry`, `parseSettingsJson`, `parseHistoryJson`) and shared interface-conformance helpers (`runSettingsRepositoryConformance`, `runHistoryRepositoryConformance`) — `packages/core` remains free of `chrome.*`/Tauri APIs.
  - `apps/extension`: Implemented `ExtensionSettingsRepository`/`ExtensionHistoryRepository` against `chrome.storage.local`, JSON-serialized under deterministic keys `promptvox:settings` / `promptvox:history`, with missing/corrupt JSON handled via defaults + validation; API keys never logged; no direct `chrome.storage` from UI. Updated `apps/extension/tsconfig.json` to include `src/**/*`.
  - `apps/desktop`: Added `tauri-plugin-sql` + `rusqlite` (bundled) with local SQLite file `promptvox.db` in app data dir via Tauri path API; created `settings` (single row, JSON `data`) and `history` (id, created_at, transcript, prompt_json) tables; implemented both repos in Rust (`apps/desktop/src-tauri/src/storage.rs`) exposed via thin typed serializable Tauri commands (`get_settings`, `set_settings`, `list_history`, `add_history`, `remove_history`, `clear_history`) never blocking UI thread; frontend wrappers (`apps/desktop/src/storage/*`) satisfy same TS interfaces from `@promptvox/core`.
  - Verified `pnpm --filter @promptvox/core build`, `pnpm --filter @promptvox/ui build`, `pnpm --filter @promptvox/extension build` (wxt), `pnpm --filter @promptvox/desktop build` (tsc+vike), `cargo check` all pass; `pnpm lint` (eslint) clean with strict TS.

## In Progress

- None.

## Next Up

- Feature Spec 05: Cloud STT Provider (OpenAI/Groq/Deepgram) per `feature-specs/05-cloud-stt-provider.md`.

## Open Questions

- None at present.

## Architecture Decisions

- Design system primitives and Catppuccin Mocha theme tokens live strictly in `@promptvox/ui`.
- Core types and pluggable provider/storage interfaces live in `@promptvox/core` with zero DOM or platform dependencies.

## Session Notes

- Feature Specs 01, 02, and 03 implemented, built, and committed to `fm/promptvox-scaffold` branch. All builds verified.
- Feature Spec 04 implemented on `fm/implement-spec-04-settings-storage-repos-32` — extension (`chrome.storage.local` JSON under `promptvox:settings`/`promptvox:history`) and desktop (SQLite `promptvox.db` via `tauri-plugin-sql`+`rusqlite`, Rust commands) both satisfy identical `SettingsRepository`/`HistoryRepository` interfaces from `@promptvox/core`; validation at storage boundary, API keys never logged; no direct storage from UI; `eslint` clean, all builds verified.

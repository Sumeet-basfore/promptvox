# Progress Tracker

Update this file whenever the current phase, active feature, or
implementation state changes.

## Current Phase

- Feature Spec 04 (Settings Storage) - Complete

## Current Goal

- Implement Feature Spec 05 (Cloud STT Providers: OpenAI, Groq, Deepgram) in `packages/core`.

## Completed

- Feature Spec 01: Scaffolded pnpm monorepo with `@promptvox/core`, `@promptvox/ui`, `apps/extension` (WXT Manifest V3), and `apps/desktop` (Tauri 2). Verified root `pnpm install`, TypeScript compilation, WXT extension build, and Tauri desktop frontend/backend checks.
- Feature Spec 02: Built shared design system in `@promptvox/ui` with Catppuccin Mocha CSS custom properties, shadcn UI components (`Button`, `Card`, `Dialog`, `Input`, `Textarea`, `Tabs`, `Switch`, `ScrollArea`), Tailwind utilities (`cn`), and pulsing `RecordingIndicator` component.
- Feature Spec 03: Defined core domain types (`TaskType`, `TranscriptionResult`, `ClassificationResult`, `GeneratedPrompt`, `HistoryEntry`) and provider/storage interfaces (`STTProvider`, `LLMProvider`, `SettingsRepository`, `HistoryRepository`, `Settings`, `STTConfig`, `LLMConfig`) in `@promptvox/core`.
- Feature Spec 04: Implemented `ExtensionSettingsRepository` and `ExtensionHistoryRepository` (`chrome.storage.local`) in `apps/extension` and `DesktopSettingsRepository` and `DesktopHistoryRepository` (`rusqlite` SQLite database) in `apps/desktop`. Added `DEFAULT_SETTINGS` and `conformance.ts` verification suite in `@promptvox/core`.

## In Progress

- None.

## Next Up

- Feature Spec 05: Cloud STT Providers (`openai-whisper`, `groq-whisper`, `deepgram`) and provider factory in `packages/core/providers/stt/`.

## Open Questions

- None at present.

## Architecture Decisions

- `apps/extension` uses `chrome.storage.local` serialized JSON under `promptvox_settings` and `promptvox_history` keys.
- `apps/desktop` uses a local SQLite database (`promptvox.db`) managed by `rusqlite` in the app data directory with thin, typed Tauri IPC commands.
- Shared conformance verification functions (`verifySettingsRepository`, `verifyHistoryRepository`) live in `@promptvox/core/storage/conformance.ts`.

## Session Notes

- Feature Specs 01 through 04 implemented, built, and committed to `fm/promptvox-scaffold` branch. All builds verified.

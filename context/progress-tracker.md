# Progress Tracker

Update this file whenever the current phase, active feature, or
implementation state changes.

## Current Phase

- Feature Spec 02 (Design System) & Feature Spec 03 (Core Types & Provider Interfaces) - Complete

## Current Goal

- Implement Feature Spec 04 (Settings Storage) for Extension & Desktop.

## Completed

- Feature Spec 01: Scaffolded pnpm monorepo with `@promptvox/core`, `@promptvox/ui`, `apps/extension` (WXT Manifest V3), and `apps/desktop` (Tauri 2). Verified root `pnpm install`, TypeScript compilation, WXT extension build, and Tauri desktop frontend/backend checks.
- Feature Spec 02: Built shared design system in `@promptvox/ui` with Catppuccin Mocha CSS custom properties, shadcn UI components (`Button`, `Card`, `Dialog`, `Input`, `Textarea`, `Tabs`, `Switch`, `ScrollArea`), Tailwind utilities (`cn`), and pulsing `RecordingIndicator` component.
- Feature Spec 03: Defined core domain types (`TaskType`, `TranscriptionResult`, `ClassificationResult`, `GeneratedPrompt`, `HistoryEntry`) and provider/storage interfaces (`STTProvider`, `LLMProvider`, `SettingsRepository`, `HistoryRepository`, `Settings`, `STTConfig`, `LLMConfig`) in `@promptvox/core`.

## In Progress

- None.

## Next Up

- Feature Spec 04: Implement `SettingsRepository` and `HistoryRepository` for `apps/extension` (`chrome.storage.local`) and `apps/desktop` (`tauri-plugin-sql` + SQLite), adhering to `@promptvox/core` storage contracts.

## Open Questions

- None at present.

## Architecture Decisions

- Design system primitives and Catppuccin Mocha theme tokens live strictly in `@promptvox/ui`.
- Core types and pluggable provider/storage interfaces live in `@promptvox/core` with zero DOM or platform dependencies.

## Session Notes

- Feature Specs 01, 02, and 03 implemented, built, and committed to `fm/promptvox-scaffold` branch. All builds verified.

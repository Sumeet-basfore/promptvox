# Progress Tracker

Update this file whenever the current phase, active feature, or
implementation state changes.

## Current Phase

- Feature Spec 01 (Monorepo Scaffolding) - Complete

## Current Goal

- Feature Spec 02: Design System setup in `@promptvox/ui` or Feature Spec 03: Core Types & Provider Interfaces.

## Completed

- Feature Spec 01: Scaffolded pnpm monorepo with `@promptvox/core`, `@promptvox/ui`, `apps/extension` (WXT Manifest V3), and `apps/desktop` (Tauri 2). Verified root `pnpm install`, TypeScript compilation, WXT extension build, and Tauri desktop frontend/backend checks.

## In Progress

- None.

## Next Up

- Feature Spec 02: Design System setup in `@promptvox/ui` with Catppuccin Mocha tokens, Tailwind CSS variables, typography, border radius scale, and shadcn/ui foundation.
- Feature Spec 03: Core Types and Provider Interfaces (`STTProvider`, `LLMProvider`, `SettingsRepository`, `HistoryRepository`).

## Open Questions

- None at present.

## Architecture Decisions

- Shared monorepo structure with `@promptvox/core` (strict TS, no DOM/Tauri deps), `@promptvox/ui` (React + Tailwind + shadcn/ui), `apps/extension` (WXT + React), and `apps/desktop` (Tauri 2 + Rust + React).

## Session Notes

- Monorepo scaffold complete and committed to `fm/promptvox-scaffold` branch. All builds verified.

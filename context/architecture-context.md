# Architecture Context

## Stack

| Layer               | Technology                          | Role                                                          |
| -------------------- | ------------------------------------ | -------------------------------------------------------------- |
| Monorepo             | pnpm workspaces                      | Shared core consumed by both platform apps                     |
| Shared core          | TypeScript                           | Provider interfaces, classification, template engine, types    |
| Shared UI            | React + Tailwind + shadcn/ui         | Component library used by both apps                            |
| Browser extension    | WXT (Manifest V3) + React            | Popup UI, background service worker, content-script insertion  |
| Desktop app           | Tauri 2 (Rust + React)               | Native window, global hotkey, local STT execution               |
| Local STT (desktop)  | `whisper-rs` (whisper.cpp bindings)  | On-device transcription using local GGUF Whisper models         |
| Local STT (extension)| Transformers.js (WASM/WebGPU Whisper)| On-device transcription inside the browser sandbox              |
| Cloud STT            | OpenAI, Groq, Deepgram (pluggable)   | Off-device transcription via the user's own API key             |
| Local LLM            | User's local `llama-server` endpoint | OpenAI-compatible local inference for classification + generation |
| Cloud LLM            | OpenAI-compatible providers          | Off-device classification + generation via the user's own API key |
| Extension storage    | `chrome.storage.local`               | Settings and history, extension-side                            |
| Desktop storage      | SQLite (`tauri-plugin-sql`)          | Settings and history, desktop-side                               |

## System Boundaries

- `packages/core` — platform-agnostic logic: STT provider interface and
  implementations, LLM provider interface and implementations, intent
  classifier, prompt template engine, shared types. No DOM or Tauri APIs
  here.
- `packages/ui` — shared React components (design system) consumed by
  both the extension popup and the desktop app frontend.
- `apps/extension` — WXT project: popup UI, background service worker,
  content script for insertion, `chrome.storage.local` repository
  implementation.
- `apps/desktop` — Tauri project: React frontend (`src/`) plus a Rust
  backend (`src-tauri/`) that owns the global hotkey, microphone capture,
  local Whisper execution, and SQLite repository implementation.

## Provider Abstraction Model

- STT and LLM are both accessed through a provider interface defined
  once in `packages/core`. Each concrete provider (local or cloud)
  implements that interface.
- The app layer never calls a provider SDK directly — it resolves the
  active provider from settings and calls the interface.
- Adding a new provider means adding a new implementation in
  `packages/core`, not touching app-layer code.

## Storage Model

- Settings and history are local-only, per install. There is no backend
  and no account system in v1.
- Each app implements the same `SettingsRepository` and
  `HistoryRepository` interfaces from `packages/core` against its own
  storage: `chrome.storage.local` for the extension, SQLite for desktop.
- API keys are stored using the platform's local storage only — never
  transmitted anywhere except directly to the provider they belong to.

## Capture and Output Model

- Voice capture is platform-specific (browser `MediaRecorder` vs. Tauri
  Rust-side audio capture) and lives entirely in the app layer.
- Everything after "raw audio buffer" — STT, classification, template
  filling — is shared core logic and must behave identically on both
  platforms given the same input and the same provider configuration.
- Output insertion is platform-specific: clipboard copy on both, plus
  focused-field insertion on the extension where the browser allows it.

## Invariants

1. `packages/core` contains no `chrome.*` or Tauri-specific APIs.
2. No generated prompt is used (copied, inserted) without passing
   through the editable review step.
3. Local-only configuration (local STT + local LLM) must never make a
   network call.
4. API keys for cloud providers never leave the device except in a
   direct request to that provider.
5. Both apps implement the same core interfaces — a feature is not
   "done" until it works through both `apps/extension` and
   `apps/desktop`.

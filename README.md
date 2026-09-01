# PromptVox

PromptVox is a voice-to-prompt tool for developers. Speak a rough,
unstructured description of a task — a feature request, a bug report, a
refactor ask — and PromptVox transcribes it, classifies the intent, and
generates a clean, structured Markdown prompt ready to paste into an AI
coding agent (Claude Code, Cursor, Copilot Workspace, or similar).

It ships as a **WXT browser extension** (Manifest V3) and a **Tauri 2
desktop app**, both built on one shared core.

## How it works

1. Trigger voice capture via a hotkey (desktop) or extension shortcut/popup.
2. Speak your task description.
3. Audio is transcribed by your configured STT provider.
4. The transcript is classified into a task type: `feature`, `bug`,
   `refactor`, `question`, or `other`.
5. A structured prompt is generated from the transcript using the matching
   template.
6. The prompt is shown in an **editable review view** — never auto-submitted.
7. You copy the prompt (or insert it into the focused field, in the extension),
   and the conversion is saved to local history.

## Features

- **Voice capture** — push-to-talk hotkey on both platforms with clear
  recording state and microphone-permission handling.
- **Pluggable STT** — local (on-device) or cloud, user-selectable:
  OpenAI Whisper, Groq Whisper, Deepgram, plus local models.
- **Pluggable LLM** — local (`llama-server`/OpenAI-compatible) or cloud for
  classification and prompt generation.
- **Intent classification** — feature / bug / refactor / question / other.
- **Structured prompt generation** — per-intent Markdown templates with goal,
  context, acceptance criteria, constraints, and out-of-scope sections.
- **Editable review step** — every generated prompt is reviewable before use.
- **Local history & settings** — per-install, no account system, no cloud sync.
- **100% local mode** — with local STT + local LLM, no network calls are made.

## Architecture

This is a pnpm TypeScript monorepo:

| Package / app    | Role                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `packages/core`  | Platform-agnostic logic: types, provider interfaces, STT/LLM implementations, classifier, templates |
| `packages/ui`    | Shared React + shadcn/ui design system (Catppuccin Mocha)                                           |
| `apps/extension` | WXT Manifest V3 browser extension (React popup + service worker)                                    |
| `apps/desktop`   | Tauri 2 app (React frontend + Rust backend)                                                         |

Key boundaries:

- `packages/core` contains **no** `chrome.*` or Tauri APIs.
- Both apps implement the same core provider and storage interfaces.
- Voice capture and output plumbing are platform-specific and live only in the
  app layer.
- API keys are stored locally and sent only to the provider they belong to;
  they are never logged.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://www.rust-lang.org/) and the [Tauri 2 prerequisites](https://tauri.app/start/prerequisites/)
  (for the desktop app)

### Install

```bash
pnpm install
```

### Develop

```bash
# Browser extension (WXT dev mode)
pnpm --filter @promptvox/extension dev

# Desktop app (Tauri dev mode)
pnpm --filter @promptvox/desktop tauri:dev
```

### Build

```bash
# Build everything (core, ui, extension, desktop frontend)
pnpm build

# Extension production build
pnpm --filter @promptvox/extension build

# Desktop app installer/bundle
pnpm --filter @promptvox/desktop tauri:build
```

### Lint & format

```bash
pnpm lint          # ESLint
pnpm format        # Prettier check
pnpm format:write  # Prettier write
```

## Project status

Progress is tracked in `context/progress-tracker.md`. Completed so far:

- **Spec 01** — Monorepo scaffolding (core, ui, extension, desktop).
- **Spec 02** — Shared design system in `packages/ui`.
- **Spec 03** — Core domain types and provider/storage interfaces.
- **Spec 04** — Settings & history storage repositories (extension
  `chrome.storage.local`, desktop SQLite).
- **Spec 05** — Cloud STT providers (OpenAI, Groq, Deepgram).

Up next: **Spec 06** — Local STT provider (desktop, `whisper-rs`).

## Development workflow

All work is committed directly to the `main` branch. Do not create new
branches, and push only to `main`.

Before making changes, read `AGENTS.md` and the context files in `context/`,
then the relevant numbered specification in `feature-specs/`.

## License

Proprietary — all rights reserved.

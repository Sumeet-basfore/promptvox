# PromptVox

## Overview

PromptVox is a voice-to-prompt agent for developers. A user speaks a
rough, unstructured description of a task — a feature request, a bug
report, a refactor ask — and PromptVox transcribes it, classifies the
intent, and generates a clean, structured prompt ready to paste into an
AI coding agent (Claude Code, Cursor, Copilot Workspace, or similar).

This is a narrow-vertical v1, deliberately scoped to one workflow
(dev-task prompts) and available on two platforms (browser extension and
desktop app) so it fits into wherever the user already works.

## Goals

1. Let a user dictate a task in natural, rambling speech and get back a
   structured prompt, not a raw transcript.
2. Classify the dictated task into a known type (feature, bug, refactor,
   question, other) and shape the prompt accordingly.
3. Let the user choose their own speech-to-text backend (local or cloud).
4. Let the user choose their own LLM backend for classification and
   prompt generation (local or cloud).
5. Give the user an editable review step before the prompt is used —
   never auto-submit generated output anywhere.
6. Ship on both a browser extension and a desktop app from a shared core.

## Core User Flow

1. User triggers voice capture via a hotkey (desktop) or extension
   shortcut/popup (browser).
2. User speaks their task description.
3. Audio is transcribed by the user's configured STT provider.
4. The transcript is classified into a task type.
5. A structured prompt is generated from the transcript using the
   matching template for that task type.
6. The generated prompt is shown in an editable review view.
7. User edits if needed, then copies the prompt (or inserts it into the
   focused field, on the extension).
8. The conversion is saved to local history.

## Features

### Voice Capture

- Push-to-talk hotkey on both platforms.
- Microphone permission handling and clear recording state.

### Speech-to-Text

- Pluggable STT backend, user-selected: local (on-device) or cloud API.
- Local: runs fully offline, no audio leaves the device.
- Cloud: requires the user's own API key for their chosen provider.

### Intent Classification

- Classifies a transcript into one of: feature, bug, refactor, question,
  other.
- Runs through the user's configured LLM backend (local or cloud).

### Prompt Generation

- Per-intent-type structured template (goal, context, acceptance
  criteria, constraints, out-of-scope).
- Template is filled from the transcript by the LLM backend.
- Output is a single Markdown prompt block.

### Review and Output

- Editable output view before any copy/insert action.
- One-click copy on both platforms.
- Insert into the currently focused text field on the extension, where
  the browser API allows it.

### Settings

- STT provider selection and credentials/model path.
- LLM provider selection and credentials/model path.
- No settings are shared across devices — everything is local to the
  install.

### History

- Local, per-install log of past conversions (transcript + generated
  prompt), viewable and deletable.

## Scope

### In Scope

- Browser extension (Manifest V3) and desktop app (Tauri) from one
  shared core package.
- Local and cloud STT, user-selectable.
- Local and cloud LLM, user-selectable.
- One vertical: dev-task prompts (feature / bug / refactor / question /
  other).
- Local history and local settings, no account system.
- Editable review step before any output is used.

### Out of Scope

- Multi-language voice input (English only for v1).
- Team or shared/collaborative features of any kind.
- Mobile apps.
- Any vertical other than dev-task prompts (writing, image-gen, etc.).
- Auto-submitting the generated prompt to any external agent or tool.
- Cloud sync of settings or history across devices.

## Success Criteria

1. A user can dictate a task and receive a structured, editable prompt
   without touching a keyboard until the review step.
2. The same core logic (capture → STT → classify → generate) works
   identically on both platforms, only the capture and output plumbing
   differ.
3. A user can fully configure PromptVox to run 100% locally, with no
   network calls, if they choose local STT + local LLM.
4. Switching STT or LLM provider requires only a settings change, no
   code change.
5. Every generated prompt is reviewable and editable before it leaves
   PromptVox.

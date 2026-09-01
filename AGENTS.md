# PromptVox

PromptVox is a pnpm TypeScript monorepo for a voice-to-prompt developer tool.
It will ship as a WXT browser extension and a Tauri 2 desktop application.

## Before working

Read these files in order:

1. `context/project-overview.md`
2. `context/architecture-context.md`
3. `context/ui-context.md`
4. `context/code-standards.md`
5. `context/ai-workflow-rules.md`
6. `context/progress-tracker.md`

For implementation details, read the relevant numbered specification in
`feature-specs/` before changing code.

## Architecture rules

- Keep platform-agnostic logic in `packages/core`.
- Keep shared UI primitives and components in `packages/ui`.
- Do not use Chrome or Tauri APIs inside `packages/core`.
- Both applications must use the same core provider, pipeline, and storage interfaces.
- Do not duplicate provider logic in either application.
- Local STT and LLM configurations must never make network calls.
- API keys must not be logged or included in errors.
- Generated prompts must always pass through the editable review step before copying or inserting.
- Desktop Rust commands should be thin, typed, serializable, and must not block the UI thread.

## Workflow

- All work is committed directly to the `main` branch. Do not create new
  branches, and push only to `main`.
- Implement one feature specification at a time.
- Prefer small, verifiable increments.
- Do not invent behavior missing from the specifications; record ambiguity in
  `context/progress-tracker.md`.
- A feature is complete only after verifying every platform named by its specification.
- Update `context/progress-tracker.md` after each meaningful implementation change.
- Keep generated third-party foundation components unchanged unless explicitly requested.

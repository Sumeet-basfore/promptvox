# Development Workflow

## Approach

Build this project incrementally using a spec-driven workflow. Context
files define what to build, how to build it, and what the current state
of progress is. Always implement against these specs — do not infer or
invent behavior from scratch.

## Scoping Rules

- Work on one feature unit or subsystem at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation
  step.

## When To Split Work

Split an implementation step if it combines:

- Shared core logic (`packages/core`) changes and app-specific UI changes
- Extension-specific implementation and desktop-specific implementation
  of the same feature
- A new provider implementation and a change to the provider interface
  itself
- Rust (`src-tauri`) changes and unrelated TypeScript frontend changes
- Behavior that is not clearly defined in the context files

If a change cannot be verified end to end quickly on the platform it
targets, the scope is too broad — split it.

## Platform Parity Rule

A feature is not complete until it works on both `apps/extension` and
`apps/desktop`. When a feature unit only covers one platform, its spec
says so explicitly and a matching unit for the other platform must exist
separately. Do not silently ship a feature on only one platform.

## Handling Missing Requirements

- Do not invent product behavior that is not defined in the context
  files.
- If a requirement is ambiguous, resolve it in the relevant context file
  before implementing.
- If a requirement is missing, add it as an open question in
  `progress-tracker.md` before continuing.

## Protected Foundation Components

Do not modify generated third-party foundation components unless
explicitly instructed. This includes:

- `components/ui/*` (shadcn/ui components) in `packages/ui`
- Third-party library internals (`whisper-rs`, Tauri plugins, etc.)

Project-specific behavior belongs in app-level or core-level code, not
inside these foundation pieces.

## Keeping Docs In Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries
- Storage model decisions
- Provider interface shape
- Code conventions or standards
- Feature scope

Progress state must reflect the actual state of the implementation, not
the intended state.

## Before Moving To The Next Unit

1. The current unit works end to end within its defined scope, on every
   platform its spec targets.
2. No invariant defined in `architecture-context.md` was violated.
3. `progress-tracker.md` reflects the completed work.

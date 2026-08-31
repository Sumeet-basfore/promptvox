## Application Building Context

This is a pnpm monorepo with a shared core package and two platform apps
(browser extension + desktop app). Read the following files in order
before implementing or making any architectural decision:

1. `context/project-overview.md` — product definition, goals, features, and scope
2. `context/architecture-context.md` — system structure, boundaries, storage model, and invariants
3. `context/ui-context.md` — theme, colors, typography, and component conventions
4. `context/code-standards.md` — implementation rules and conventions
5. `context/ai-workflow-rules.md` — development workflow, scoping rules, and delivery approach
6. `context/progress-tracker.md` — current phase, completed work, open questions, and next steps

Update `context/progress-tracker.md` after each meaningful implementation change.

If implementation changes the architecture, scope, or standards documented
in the context files, update the relevant file before continuing.

## Monorepo Awareness

- `packages/core` is shared between both apps. A change here affects
  `apps/extension` and `apps/desktop` simultaneously — verify both still
  build before considering a core change complete.
- Never duplicate provider logic (STT, LLM) inside an app package. If an
  app needs platform-specific behavior, express it as a new implementation
  of the shared interface in `packages/core`, not a parallel one-off.
- `apps/desktop` has a Rust layer (`src-tauri/`) in addition to its
  TypeScript frontend. Read the relevant Tauri command signatures before
  changing anything that crosses the JS/Rust boundary.

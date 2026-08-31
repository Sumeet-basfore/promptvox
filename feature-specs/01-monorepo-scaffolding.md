Set up the pnpm monorepo skeleton. No feature logic yet.

## Implementation

Create the workspace with:

- `packages/core` — empty TypeScript package, strict mode, no
  dependencies on DOM or Tauri APIs.
- `packages/ui` — empty React component package, depends on Tailwind
  and shadcn/ui config.
- `apps/extension` — WXT project scaffold (Manifest V3), React.
- `apps/desktop` — Tauri 2 project scaffold, React frontend.

Add a root `pnpm-workspace.yaml` covering `packages/*` and `apps/*`.

Add shared root-level configs:

- `tsconfig.base.json` (strict mode) extended by every package/app.
- Shared ESLint and Prettier config at the root.

Wire `packages/core` and `packages/ui` as workspace dependencies of both
`apps/extension` and `apps/desktop`.

## Scope Limits

- No provider logic, no UI components beyond the default scaffold.
- Do not add any business logic in this unit — structure only.

## Check When Done

- `pnpm install` succeeds at the root.
- `apps/extension` builds via WXT with no errors.
- `apps/desktop` builds via Tauri with no errors.
- Both apps can import from `packages/core` and `packages/ui` without
  path errors.

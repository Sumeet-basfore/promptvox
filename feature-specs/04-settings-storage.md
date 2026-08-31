Read `packages/core/storage/types.ts` before starting.

Implement `SettingsRepository` and `HistoryRepository` for both
platforms.

## Implementation

### Extension (`apps/extension`)

- Implement both repositories against `chrome.storage.local`.
- Serialize `HistoryEntry[]` and `Settings` as JSON under fixed keys.

### Desktop (`apps/desktop`)

- Add `tauri-plugin-sql` with a local SQLite database file in the app
  data directory.
- Create a `settings` table (single row) and a `history` table matching
  `HistoryEntry`.
- Implement both repositories against SQLite from the Rust side, exposed
  to the frontend via Tauri commands.

Both implementations must satisfy the exact same TypeScript interface
from `packages/core`, so app-layer code never branches on platform to
read or write settings/history.

## Scope Limits

- No settings UI yet — this unit is the storage layer only.
- No sync between platforms — each install's storage is independent.

## Check When Done

- Extension: settings and history persist across popup close/reopen and
  browser restart.
- Desktop: settings and history persist across app restart.
- Both implementations pass the same interface-conformance test suite in
  `packages/core`.

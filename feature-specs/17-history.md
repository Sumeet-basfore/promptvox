Read `packages/core/storage/types.ts` (`HistoryRepository`) before
starting.

Implement the history list UI on both platforms.

## Implementation

Build a shared `HistoryList` component in `packages/ui` that takes a
`HistoryEntry[]` and renders:

- a reverse-chronological list, each entry showing a truncated
  transcript, task type, and timestamp
- expand-to-view the full generated prompt for an entry
- a per-entry delete action
- a "Clear all" action with a confirmation step

Wire this component in both apps:

- `apps/desktop`: a tab or slide-over panel reachable from the main
  view, backed by the SQLite `HistoryRepository`.
- `apps/extension`: a view reachable from the popup header, backed by
  the `chrome.storage.local` `HistoryRepository`.

## Scope Limits

- No search/filter in v1 — a plain reverse-chronological list is enough.
- No export functionality yet.

## Check When Done

- History entries created in the review-step units appear correctly in
  this list on both platforms.
- Deleting an entry and clearing all history work and persist correctly.

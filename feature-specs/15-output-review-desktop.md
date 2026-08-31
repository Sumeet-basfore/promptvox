Read `context/project-overview.md` — the review step is required before
any output is used.

Implement the output review view on the desktop app.

## Implementation

In `apps/desktop/src`:

- Build a review view shown after the pipeline completes, containing:
  - the generated prompt Markdown in an editable `Textarea`
  - the detected task type, shown but not editable in v1
  - a "Copy" button that copies the current (possibly edited) textarea
    content to the clipboard
  - a "Regenerate" button that re-runs generation from the same
    transcript (does not re-record audio)
  - a "Discard" action that returns to the idle/capture state without
    saving
- On a successful copy, save the entry to history (transcript + final
  edited prompt) via `HistoryRepository`. A discarded result is not
  saved.

## Scope Limits

- Do not allow editing the detected task type in v1 — only the prompt
  text itself.
- Desktop only.

## Check When Done

- The review view shows the generated prompt and lets the user edit it
  before copying.
- Copying saves the edited (not the original) content to history.
- Discarding does not create a history entry.

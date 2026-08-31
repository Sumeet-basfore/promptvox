Read `context/project-overview.md` — the review step is required before
any output is used, and `15-output-review-desktop.md` for the shared
shape of this view.

Implement the output review view on the browser extension.

## Implementation

In `apps/extension`:

- Build the same review view as the desktop app (editable textarea,
  detected task type, Regenerate, Discard) inside the popup.
- Add an "Insert" action in addition to "Copy": attempts to insert the
  current textarea content into the page's currently focused editable
  element (input, textarea, or `contenteditable`) via the content
  script, falling back to a clipboard copy with a notice if no editable
  element is focused or insertion is blocked by the page.
- On a successful copy or insert, save the entry to history via
  `HistoryRepository`, same as desktop. A discarded result is not saved.

## Scope Limits

- Do not attempt insertion into cross-origin iframes.
- Extension only.

## Check When Done

- The popup shows the same review capability as desktop (edit, copy,
  regenerate, discard).
- Insert correctly places the text into a focused field on a normal
  page, and falls back to copy-with-notice when it can't.
- History is saved on copy/insert, not on discard.

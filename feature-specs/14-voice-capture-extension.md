Read `context/ui-context.md` for the recording indicator before
starting.

Implement voice capture on the browser extension.

## Implementation

In `apps/extension`:

- Register a keyboard shortcut via the `commands` key in the extension
  manifest (configurable by the user through the browser's own
  extension-shortcuts page — link to it from settings rather than
  reimplementing shortcut config).
- On trigger, open the popup (if not already open) and request
  microphone permission if not already granted, with a clear explanation
  if denied.
- Use `MediaRecorder` in the popup to capture audio while the hotkey is
  held or until the user clicks stop (popup-based capture, since a
  service worker cannot access the microphone directly).
- Show the `RecordingIndicator` from `packages/ui` while capture is
  active.
- On stop, call `generatePrompt()` from `packages/core` with the
  currently configured providers, and hand off to the review view (built
  in a later unit).

## Scope Limits

- Extension only.
- If microphone permission is permanently denied, show a clear message
  with a link to the browser's site-permission settings — do not loop
  the permission prompt.

## Check When Done

- Triggering the shortcut opens the popup and starts capture (after
  permission is granted).
- Stopping capture triggers the pipeline and the recording indicator
  disappears immediately.
- A denied microphone permission produces a clear, non-looping message
  instead of a silent failure.

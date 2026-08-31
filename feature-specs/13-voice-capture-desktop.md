Read `context/ui-context.md` for the recording indicator before
starting.

Implement voice capture on the desktop app.

## Implementation

In `apps/desktop/src-tauri`:

- Add `tauri-plugin-global-shortcut`, registering a configurable
  push-to-talk hotkey (default suggested: a chord unlikely to collide
  with OS shortcuts).
- On hotkey press, start microphone capture; on release, stop and emit
  the recorded audio buffer to the frontend via a Tauri event.

In `apps/desktop/src`:

- Show the `RecordingIndicator` from `packages/ui` while capture is
  active.
- On receiving the recorded audio, call `generatePrompt()` from
  `packages/core` with the currently configured providers, and hand off
  to the review view (built in a later unit).
- Show a loading state between "recording stopped" and "prompt ready."

## Scope Limits

- Desktop only.
- Hotkey is global (works while the app is unfocused/minimized) but
  configuration UI for changing it comes in the settings unit — hardcode
  a sensible default for now.

## Check When Done

- Pressing the hotkey from anywhere in the OS starts capture; releasing
  it stops capture and triggers the pipeline.
- The recording indicator is visible for the full duration of capture
  and disappears immediately on stop.

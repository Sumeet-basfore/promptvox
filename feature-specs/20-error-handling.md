Read `12-prompt-generation-pipeline.md` (`PipelineError`) before
starting.

Add consistent error and empty-state handling across both apps.

## Implementation

Add a shared `ErrorBanner` component in `packages/ui` that takes a
stage (`"transcription" | "classification" | "generation" | "other"`)
and a message, and renders a stage-specific, plain-language explanation
plus a "Try again" action.

Wire it to handle, on both platforms:

- Microphone permission denied or unavailable.
- `PipelineError` from any stage (transcription/classification/
  generation failure) — map each `PipelineError` stage to a specific
  message, do not show a generic "something went wrong."
- Missing/invalid provider credentials (`MissingCredentialsError`,
  `ModelNotConfiguredError`, `LocalEndpointUnreachableError`) — message
  should point the user directly at the settings screen.
- Empty history state — friendly empty state, not a blank list.

## Scope Limits

- No retry-with-backoff or automatic retries — "Try again" is always a
  user-initiated action.
- No telemetry/error reporting in v1 — errors are surfaced to the user
  only.

## Check When Done

- Every error type listed above produces a distinct, correct message,
  not a generic fallback.
- "Try again" correctly re-attempts the failed stage without requiring a
  full app restart.
- The empty history state renders correctly on first use, before any
  entries exist.

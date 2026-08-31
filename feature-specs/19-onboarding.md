Read `18-settings-ui.md` before starting — onboarding reuses the same
provider selectors.

Implement first-run onboarding on both platforms.

## Implementation

On first launch (no `Settings` saved yet), show a short guided setup
instead of the normal idle/capture view:

1. Explain what PromptVox does in one or two lines.
2. Ask the user to choose an STT provider (reuses the selector from the
   settings unit) and configure it.
3. Ask the user to choose an LLM provider (reuses the selector from the
   settings unit) and configure it.
4. Run "Test connection" for both before allowing the user to finish.
5. On the extension: request microphone permission as part of this flow
   rather than waiting for the first capture attempt.
6. On completion, write the resulting `Settings` and route to the normal
   idle/capture view.

## Scope Limits

- Onboarding is shown once, gated purely on "no settings saved yet" —
  no separate "onboarding completed" flag needed.
- Do not let the user finish onboarding with a provider configured but
  failing "Test connection" — surface the failure and block completion
  until resolved or a different provider is chosen.

## Check When Done

- A fresh install shows onboarding, not the idle view.
- Onboarding cannot be completed with an untested or failing provider
  configuration.
- After completion, the idle/capture view appears and normal settings
  are editable from there going forward.

Read `packages/core/storage/types.ts` (`Settings`) and the provider
units (05, 06, 07, 08, 09) before starting.

Implement the settings UI on both platforms.

## Implementation

Build a shared `SettingsForm` component in `packages/ui` with:

- STT provider selector: Local vs. Cloud, with a sub-selector for which
  cloud provider (OpenAI / Groq / Deepgram) or, for local, a file/path
  picker for the GGUF model (desktop) or a fixed "on-device model"
  indicator (extension, no path needed).
- LLM provider selector: Local vs. Cloud, with base URL + model name
  fields for local, and provider + API key + model fields for cloud.
- API key fields are masked inputs, never rendered back in plaintext
  after saving.
- A "Test connection" action per configured provider that runs a minimal
  real call and shows success/failure inline.
- Save writes through `SettingsRepository`.

Wire this component in both apps, reading/writing through each
platform's `SettingsRepository` implementation.

## Scope Limits

- No provider-specific advanced tuning (temperature, etc.) in v1.
- Extension: since there is no local desktop model-path concept, the
  local STT option there just indicates the bundled on-device model —
  no path field.

## Check When Done

- Changing a provider selection and saving actually changes which
  provider the pipeline uses on the next capture, with no code change.
- "Test connection" correctly reports success/failure for each
  configured provider.
- API keys are never shown in plaintext after being saved once.

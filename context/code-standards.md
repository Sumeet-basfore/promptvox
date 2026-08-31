# Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes — do not layer workarounds.
- Do not mix unrelated concerns in one component or module.
- Respect the system boundaries defined in `architecture-context.md`.

## TypeScript

- Strict mode is required throughout the monorepo.
- Avoid `any`; use explicit interfaces or narrowly scoped types.
- Validate unknown external input (provider API responses, stored
  settings) at the boundary before trusting it.
- Use `interface` for provider contracts (`STTProvider`, `LLMProvider`,
  `SettingsRepository`, `HistoryRepository`).

## Rust (`apps/desktop/src-tauri`)

- Keep Tauri commands thin — a command validates input and delegates,
  it does not contain business logic.
- Long-running work (transcription, model loading) runs off the main
  thread; never block the UI thread.
- Return typed, serializable errors across the Tauri IPC boundary —
  never a raw panic message.

## Provider Implementations

- A provider implementation only implements the interface — it does not
  add provider-specific methods that the app layer depends on directly.
- Cloud providers must fail with a clear, typed error on missing or
  invalid credentials before attempting a network call.
- Local providers must fail with a clear, typed error if the required
  model/binary/endpoint is not available, rather than hanging silently.

## Styling

- Use the CSS custom property tokens defined in `packages/ui` — no raw
  hex values or default Tailwind color classes.
- Maintain the border radius scale from `ui-context.md`.

## Data and Storage

- Settings and history go through the `SettingsRepository` /
  `HistoryRepository` interfaces — no direct `chrome.storage` or SQL
  calls from UI components.
- API keys are never logged, never included in error messages, and
  never written anywhere except the platform's local settings store.

## File Organization

- `packages/core/providers/stt/` — STT provider interface and
  implementations.
- `packages/core/providers/llm/` — LLM provider interface and
  implementations.
- `packages/core/prompt/` — intent classifier and template engine.
- `packages/core/storage/` — repository interfaces (implementations live
  in each app).
- `packages/ui/` — shared components only, no business logic.
- `apps/extension/` — extension-specific entry points and repository
  implementations.
- `apps/desktop/src/` — desktop frontend entry points and repository
  implementations.
- `apps/desktop/src-tauri/` — Rust backend: hotkey, audio capture, local
  STT execution.
- Name files after the responsibility they contain, not the technology.

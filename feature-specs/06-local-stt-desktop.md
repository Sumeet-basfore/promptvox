Read `context/architecture-context.md` for the local STT model before
starting.

Implement the desktop local `STTProvider` using `whisper-rs`.

## Implementation

In `apps/desktop/src-tauri`:

1. Add `whisper-rs` as a dependency.
2. Add a Tauri command `transcribe_local(audio: Vec<u8>, model_path: String) -> Result<String, String>` that:
   - loads the GGUF Whisper model from the given path (cache the loaded
     model between calls — do not reload per request)
   - runs transcription off the main thread
   - returns the transcript text, or a typed error string if the model
     file is missing or fails to load

In `packages/core/providers/stt/local/desktop.ts`:

- Implement `STTProvider` with `kind: "local"` that calls the
  `transcribe_local` Tauri command via `@tauri-apps/api`.
- Throw a typed `ModelNotConfiguredError` if no local model path is set
  in settings, before invoking the command.

## Dependencies

The user supplies their own GGUF Whisper model file path in settings
(added in the settings UI unit) — do not bundle a model.

## Scope Limits

- Desktop only. Do not touch the extension in this unit.
- Do not add model download/management UI — path configuration only.

## Check When Done

- Given a valid local model path, `transcribe_local` returns a correct
  transcript for a sample recording, fully offline (network disabled).
- A missing model path or file produces a clear typed error, not a
  crash or hang.

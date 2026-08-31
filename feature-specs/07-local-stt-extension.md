Read `context/architecture-context.md` for the local STT model before
starting.

Implement the extension local `STTProvider` using Transformers.js.

## Implementation

In `apps/extension`:

1. Add `@xenova/transformers` (or current equivalent Transformers.js
   package).
2. Run the Whisper model (small/base, quantized) inside an offscreen
   document, since a background service worker cannot run WASM/WebGPU
   inference reliably in Manifest V3.
3. Load the model once and cache it in the offscreen document; do not
   reload per transcription request.

In `packages/core/providers/stt/local/extension.ts`:

- Implement `STTProvider` with `kind: "local"` that messages the
  offscreen document with the recorded audio and awaits the transcript.
- Throw a typed `ModelLoadError` if the model fails to load or download
  on first use.

## Scope Limits

- Extension only. Do not touch the desktop app in this unit.
- Use one fixed model size for v1 — no model-size picker yet.

## Check When Done

- A sample recording is transcribed correctly fully offline after the
  model has been downloaded once.
- The service worker itself never attempts to run the model directly —
  all inference happens in the offscreen document.

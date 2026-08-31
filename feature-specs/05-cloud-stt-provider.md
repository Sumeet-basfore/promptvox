Read `packages/core/providers/stt/types.ts` before starting.

Implement cloud `STTProvider`s in `packages/core/providers/stt/cloud/`.

## Implementation

Add one implementation per provider, each satisfying `STTProvider` with
`kind: "cloud"`:

- `openai-whisper.ts` — calls the OpenAI audio transcription endpoint.
- `groq-whisper.ts` — calls Groq's Whisper endpoint (OpenAI-compatible
  request shape, different base URL).
- `deepgram.ts` — calls the Deepgram transcription endpoint.

Each implementation:

- Accepts its API key via constructor argument (never reads from a
  global or `process.env` — the caller resolves the key from settings).
- Throws a typed `MissingCredentialsError` if constructed without a key,
  before attempting any network call.
- Throws a typed `ProviderRequestError` (with the provider name and HTTP
  status) on a failed request — no silent failures.

Add a small factory in `packages/core/providers/stt/index.ts` that
resolves the active cloud provider from `Settings`.

## Scope Limits

- No local/on-device providers in this unit.
- No UI — this is provider logic only, called later from the pipeline
  unit.

## Check When Done

- Each provider transcribes a short sample audio clip correctly given a
  valid key.
- Each provider throws the correct typed error given a missing or
  invalid key, without making a network request in the missing-key case.

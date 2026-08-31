Read `packages/core/providers/llm/types.ts` and
`context/architecture-context.md` before starting.

Implement a local `LLMProvider` that talks to the user's own
`llama-server` (or any OpenAI-compatible local endpoint).

## Implementation

In `packages/core/providers/llm/local/llama-server.ts`:

- Implement `LLMProvider` with `kind: "local"`.
- Configurable with a `baseUrl` (e.g. `http://localhost:8080`) pointing
  at the user's local OpenAI-compatible server — no API key required.
- Reuse the same request-shaping logic as the cloud OpenAI-compatible
  provider where possible; do not duplicate the request-building code.
- Throw a typed `LocalEndpointUnreachableError` if the configured URL
  does not respond, with a clear message pointing at the configured URL.

## Scope Limits

- Do not attempt to manage, start, or configure the user's local server
  — PromptVox only connects to an endpoint the user already has running.
- No model-name auto-detection — the user supplies the model name their
  local server is serving, in settings.

## Check When Done

- Given a running local OpenAI-compatible server, `complete()` returns a
  real completion.
- Given an unreachable URL, the typed error is thrown quickly (bounded
  timeout), not an indefinite hang.

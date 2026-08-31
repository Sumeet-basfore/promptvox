Read `packages/core/providers/llm/types.ts` before starting.

Implement a cloud `LLMProvider` in `packages/core/providers/llm/cloud/`.

## Implementation

Add `openai-compatible.ts` — a single implementation that satisfies
`LLMProvider` with `kind: "cloud"`, configurable with:

- `baseUrl` (defaults per named provider: OpenAI, Groq; user can also
  supply a custom OpenAI-compatible base URL)
- `apiKey`
- `model` name

This one implementation covers every cloud provider that speaks the
OpenAI chat-completions format, rather than one class per provider.

- Throws a typed `MissingCredentialsError` if constructed without a key.
- Throws a typed `ProviderRequestError` (provider/base URL + HTTP
  status) on a failed request.

Add a factory in `packages/core/providers/llm/index.ts` that resolves
the active cloud provider config from `Settings`.

## Scope Limits

- No local provider in this unit.
- No prompt-specific logic here — this is a generic "send a prompt, get
  a completion" provider, used later by the classifier and template
  engine.

## Check When Done

- Given a valid key and model, `complete()` returns a real completion
  from the configured endpoint.
- Given a missing key, the typed error is thrown before any network
  call.

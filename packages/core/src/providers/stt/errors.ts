export class MissingCredentialsError extends Error {
  readonly provider: string;

  constructor(provider: string) {
    super(`${provider} STT provider requires an API key.`);
    this.name = 'MissingCredentialsError';
    this.provider = provider;
  }
}

export class ProviderRequestError extends Error {
  readonly provider: string;
  readonly status: number;

  constructor(provider: string, status: number, message?: string) {
    super(message ?? `${provider} STT request failed with status ${status}.`);
    this.name = 'ProviderRequestError';
    this.provider = provider;
    this.status = status;
  }
}

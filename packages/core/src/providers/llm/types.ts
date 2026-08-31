export interface LLMProvider {
  readonly kind: 'local' | 'cloud';
  complete(prompt: string): Promise<string>;
}

import type { TranscriptionResult } from '../../../types';
import type { STTProvider } from '../types';
import { MissingCredentialsError, ProviderRequestError } from '../errors';
import { toBlob, audioFileName } from './audio';

const GROQ_TRANSCRIPTION_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

export class GroqWhisperProvider implements STTProvider {
  readonly kind = 'cloud' as const;
  readonly provider = 'groq' as const;

  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model = 'whisper-large-v3') {
    if (apiKey.length === 0) {
      throw new MissingCredentialsError(this.provider);
    }
    this.apiKey = apiKey;
    this.model = model;
  }

  async transcribe(audio: Blob | ArrayBuffer): Promise<TranscriptionResult> {
    const blob = toBlob(audio);
    const form = new FormData();
    form.append('file', blob, audioFileName(blob));
    form.append('model', this.model);

    const response = await fetch(GROQ_TRANSCRIPTION_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
    });

    if (!response.ok) {
      throw new ProviderRequestError(this.provider, response.status);
    }

    const data = (await response.json()) as { text?: unknown };
    const text = typeof data.text === 'string' ? data.text : '';
    return { text, durationMs: 0 };
  }
}

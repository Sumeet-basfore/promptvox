import type { TranscriptionResult } from '../../../types';
import type { STTProvider } from '../types';
import { MissingCredentialsError, ProviderRequestError } from '../errors';
import { toBlob } from './audio';

const DEEPGRAM_TRANSCRIPTION_URL = 'https://api.deepgram.com/v1/listen';

export class DeepgramProvider implements STTProvider {
  readonly kind = 'cloud' as const;
  readonly provider = 'deepgram' as const;

  private readonly apiKey: string;

  constructor(apiKey: string) {
    if (apiKey.length === 0) {
      throw new MissingCredentialsError(this.provider);
    }
    this.apiKey = apiKey;
  }

  async transcribe(audio: Blob | ArrayBuffer): Promise<TranscriptionResult> {
    const blob = toBlob(audio);

    const response = await fetch(DEEPGRAM_TRANSCRIPTION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Token ${this.apiKey}`,
        'Content-Type': blob.type || 'audio/webm',
      },
      body: blob,
    });

    if (!response.ok) {
      throw new ProviderRequestError(this.provider, response.status);
    }

    const data = (await response.json()) as {
      results?: {
        channels?: Array<{
          alternatives?: Array<{ transcript?: unknown }>;
        }>;
      };
    };
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript;
    const text = typeof transcript === 'string' ? transcript : '';
    return { text, durationMs: 0 };
  }
}

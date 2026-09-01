import type { Settings } from '../../storage/types';
import type { STTProvider } from './types';
import { OpenAIWhisperProvider } from './cloud/openai-whisper';
import { GroqWhisperProvider } from './cloud/groq-whisper';
import { DeepgramProvider } from './cloud/deepgram';

export * from './types';
export * from './errors';
export * from './cloud/openai-whisper';
export * from './cloud/groq-whisper';
export * from './cloud/deepgram';

export function resolveCloudSTTProvider(settings: Settings): STTProvider {
  const { provider, apiKey } = settings.stt;

  switch (provider) {
    case 'openai':
      return new OpenAIWhisperProvider(apiKey ?? '');
    case 'groq':
      return new GroqWhisperProvider(apiKey ?? '');
    case 'deepgram':
      return new DeepgramProvider(apiKey ?? '');
    default:
      throw new Error(`No cloud STT provider for "${provider}".`);
  }
}

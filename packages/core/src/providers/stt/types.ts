import type { TranscriptionResult } from '../../types';

export interface STTProvider {
  readonly kind: 'local' | 'cloud';
  transcribe(audio: Blob | ArrayBuffer): Promise<TranscriptionResult>;
}

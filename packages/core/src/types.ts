export const CORE_VERSION = '0.1.0';

export type TaskType = 'feature' | 'bug' | 'refactor' | 'question' | 'other';

export interface TranscriptionResult {
  text: string;
  durationMs: number;
}

export interface ClassificationResult {
  taskType: TaskType;
  confidence: number;
}

export interface GeneratedPrompt {
  taskType: TaskType;
  markdown: string;
  sourceTranscript: string;
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  transcript: string;
  prompt: GeneratedPrompt;
}

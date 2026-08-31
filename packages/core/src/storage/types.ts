import type { HistoryEntry } from '../types';

export interface STTConfig {
  provider: 'local' | 'openai' | 'groq' | 'deepgram';
  modelPath?: string;
  apiKey?: string;
}

export interface LLMConfig {
  provider: 'local' | 'openai' | 'anthropic' | 'groq';
  endpoint?: string;
  apiKey?: string;
  model?: string;
}

export interface Settings {
  stt: STTConfig;
  llm: LLMConfig;
}

export interface SettingsRepository {
  get(): Promise<Settings>;
  set(settings: Settings): Promise<void>;
}

export interface HistoryRepository {
  list(): Promise<HistoryEntry[]>;
  add(entry: HistoryEntry): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

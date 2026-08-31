import type { HistoryEntry, GeneratedPrompt, TaskType } from '../types';
import type { LLMConfig, Settings, STTConfig } from './types';
import { DEFAULT_SETTINGS } from './defaults';

const VALID_STT_PROVIDERS: readonly STTConfig['provider'][] = [
  'local',
  'openai',
  'groq',
  'deepgram',
];
const VALID_LLM_PROVIDERS: readonly LLMConfig['provider'][] = [
  'local',
  'openai',
  'anthropic',
  'groq',
];
const VALID_TASK_TYPES: readonly TaskType[] = [
  'feature',
  'bug',
  'refactor',
  'question',
  'other',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function sanitizeOptionalString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

export function validateSTTConfig(input: unknown): STTConfig {
  if (!isRecord(input)) {
    return { ...DEFAULT_SETTINGS.stt };
  }
  const provider = VALID_STT_PROVIDERS.includes(
    input.provider as STTConfig['provider'],
  )
    ? (input.provider as STTConfig['provider'])
    : DEFAULT_SETTINGS.stt.provider;

  const result: STTConfig = { provider };

  const modelPath = sanitizeOptionalString(input.modelPath);
  if (modelPath !== undefined) result.modelPath = modelPath;

  const apiKey = sanitizeOptionalString(input.apiKey);
  if (apiKey !== undefined) result.apiKey = apiKey;

  return result;
}

export function validateLLMConfig(input: unknown): LLMConfig {
  if (!isRecord(input)) {
    return { ...DEFAULT_SETTINGS.llm };
  }
  const provider = VALID_LLM_PROVIDERS.includes(
    input.provider as LLMConfig['provider'],
  )
    ? (input.provider as LLMConfig['provider'])
    : DEFAULT_SETTINGS.llm.provider;

  const result: LLMConfig = { provider };

  const endpoint = sanitizeOptionalString(input.endpoint);
  if (endpoint !== undefined) result.endpoint = endpoint;

  const apiKey = sanitizeOptionalString(input.apiKey);
  if (apiKey !== undefined) result.apiKey = apiKey;

  const model = sanitizeOptionalString(input.model);
  if (model !== undefined) result.model = model;

  return result;
}

export function validateSettings(input: unknown): Settings {
  if (!isRecord(input)) {
    return { ...DEFAULT_SETTINGS, stt: { ...DEFAULT_SETTINGS.stt }, llm: { ...DEFAULT_SETTINGS.llm } };
  }
  return {
    stt: validateSTTConfig(input.stt),
    llm: validateLLMConfig(input.llm),
  };
}

export function parseSettingsJson(json: string | null | undefined): Settings {
  if (typeof json !== 'string' || json.trim() === '') {
    return { ...DEFAULT_SETTINGS, stt: { ...DEFAULT_SETTINGS.stt }, llm: { ...DEFAULT_SETTINGS.llm } };
  }
  try {
    const parsed: unknown = JSON.parse(json);
    return validateSettings(parsed);
  } catch {
    return { ...DEFAULT_SETTINGS, stt: { ...DEFAULT_SETTINGS.stt }, llm: { ...DEFAULT_SETTINGS.llm } };
  }
}

function isValidTaskType(value: unknown): value is TaskType {
  return typeof value === 'string' && (VALID_TASK_TYPES as readonly string[]).includes(value);
}

function validateGeneratedPrompt(input: unknown): GeneratedPrompt | null {
  if (!isRecord(input)) return null;
  if (!isValidTaskType(input.taskType)) return null;
  if (typeof input.markdown !== 'string') return null;
  if (typeof input.sourceTranscript !== 'string') return null;
  return {
    taskType: input.taskType,
    markdown: input.markdown,
    sourceTranscript: input.sourceTranscript,
  };
}

export function validateHistoryEntry(input: unknown): HistoryEntry | null {
  if (!isRecord(input)) return null;
  if (!isNonEmptyString(input.id)) return null;
  if (typeof input.createdAt !== 'string') return null;
  // Validate ISO 8601 date string — must parse to valid date
  const date = new Date(input.createdAt);
  if (Number.isNaN(date.getTime())) return null;
  if (typeof input.transcript !== 'string') return null;
  const prompt = validateGeneratedPrompt(input.prompt);
  if (prompt === null) return null;
  return {
    id: input.id,
    createdAt: input.createdAt,
    transcript: input.transcript,
    prompt,
  };
}

export function validateHistoryEntries(input: unknown): HistoryEntry[] {
  if (!Array.isArray(input)) return [];
  const result: HistoryEntry[] = [];
  for (const item of input) {
    const entry = validateHistoryEntry(item);
    if (entry !== null) result.push(entry);
  }
  return result;
}

export function parseHistoryJson(json: string | null | undefined): HistoryEntry[] {
  if (typeof json !== 'string' || json.trim() === '') {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(json);
    return validateHistoryEntries(parsed);
  } catch {
    return [];
  }
}

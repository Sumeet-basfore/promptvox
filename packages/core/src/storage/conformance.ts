import { DEFAULT_SETTINGS } from './defaults';
import type { Settings, SettingsRepository, HistoryRepository } from './types';
import type { HistoryEntry } from '../types';

export async function verifySettingsRepository(repo: SettingsRepository): Promise<boolean> {
  const initial = await repo.get();
  if (!initial || !initial.stt || !initial.llm) {
    return false;
  }

  const newSettings: Settings = {
    stt: { provider: 'openai', apiKey: 'test-stt-key' },
    llm: { provider: 'openai', apiKey: 'test-llm-key', model: 'gpt-4o' },
  };

  await repo.set(newSettings);
  const fetched = await repo.get();
  if (fetched.stt.provider !== 'openai' || fetched.llm.apiKey !== 'test-llm-key') {
    return false;
  }

  // Restore defaults
  await repo.set(DEFAULT_SETTINGS);
  return true;
}

export async function verifyHistoryRepository(repo: HistoryRepository): Promise<boolean> {
  await repo.clear();
  const emptyList = await repo.list();
  if (emptyList.length !== 0) {
    return false;
  }

  const sampleEntry: HistoryEntry = {
    id: 'test-1',
    createdAt: new Date().toISOString(),
    transcript: 'test transcript',
    prompt: {
      taskType: 'feature',
      markdown: '# Test Feature',
      sourceTranscript: 'test transcript',
    },
  };

  await repo.add(sampleEntry);
  const listAfterAdd = await repo.list();
  if (listAfterAdd.length !== 1 || listAfterAdd[0].id !== 'test-1') {
    return false;
  }

  await repo.remove('test-1');
  const listAfterRemove = await repo.list();
  if (listAfterRemove.length !== 0) {
    return false;
  }

  return true;
}

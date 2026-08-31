/**
 * Shared interface-conformance helpers for SettingsRepository and HistoryRepository.
 *
 * Both platform implementations (extension chrome.storage.local and desktop SQLite/Tauri)
 * must satisfy the exact same interfaces from `packages/core`. This module provides
 * factory-driven assertions that can be reused in any test runner (vitest, etc.) or
 * via direct invocation.
 *
 * No platform APIs are imported here — callers supply factories that create fresh
 * repository instances backed by isolated storage (e.g. in-memory or test doubles).
 */
import type { HistoryEntry } from '../types';
import type { HistoryRepository, Settings, SettingsRepository } from './types';
import { DEFAULT_SETTINGS } from './defaults';

function makeHistoryEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: overrides.id ?? `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    transcript: overrides.transcript ?? 'hello world',
    prompt: overrides.prompt ?? {
      taskType: 'feature',
      markdown: '# Test',
      sourceTranscript: 'hello world',
    },
  };
}

export interface ConformanceResult {
  passed: boolean;
  message: string;
}

/**
 * Run conformance checks for a SettingsRepository factory.
 * Returns an array of results; callers can assert on `passed`.
 */
export async function runSettingsRepositoryConformance(
  createRepo: () => SettingsRepository,
): Promise<ConformanceResult[]> {
  const results: ConformanceResult[] = [];

  function ok(name: string, passed: boolean, message = ''): void {
    results.push({ passed, message: passed ? `${name}: ok` : `${name}: ${message}` });
  }

  // 1) get returns defaults when empty
  {
    const repo = createRepo();
    const settings = await repo.get();
    ok(
      'get returns defaults when empty',
      settings.stt.provider === DEFAULT_SETTINGS.stt.provider &&
        settings.llm.provider === DEFAULT_SETTINGS.llm.provider,
      `expected defaults, got ${JSON.stringify(settings)}`,
    );
  }

  // 2) set then get round-trips
  {
    const repo = createRepo();
    const next: Settings = {
      stt: { provider: 'openai', apiKey: 'sk-test' },
      llm: { provider: 'anthropic', apiKey: 'sk-ant', model: 'claude-3' },
    };
    await repo.set(next);
    const got = await repo.get();
    ok(
      'set then get round-trips',
      got.stt.provider === 'openai' &&
        got.stt.apiKey === 'sk-test' &&
        got.llm.provider === 'anthropic' &&
        got.llm.model === 'claude-3',
      `got ${JSON.stringify(got)}`,
    );
  }

  // 3) set overwrites previous
  {
    const repo = createRepo();
    await repo.set({ stt: { provider: 'groq', apiKey: 'k1' }, llm: { provider: 'openai' } });
    await repo.set({ stt: { provider: 'deepgram' }, llm: { provider: 'local' } });
    const got = await repo.get();
    ok(
      'set overwrites previous',
      got.stt.provider === 'deepgram' && got.llm.provider === 'local',
      `got ${JSON.stringify(got)}`,
    );
  }

  // 4) set validates/normalizes invalid provider to default
  {
    const repo = createRepo();
    // Cast to bypass TS, simulates corrupt external input reaching storage boundary via repo
    const invalid = { stt: { provider: 'bogus' }, llm: { provider: 'also-bogus' } } as unknown as Settings;
    await repo.set(invalid);
    const got = await repo.get();
    ok(
      'invalid provider normalizes to default',
      got.stt.provider === DEFAULT_SETTINGS.stt.provider &&
        got.llm.provider === DEFAULT_SETTINGS.llm.provider,
      `got ${JSON.stringify(got)}`,
    );
  }

  return results;
}

export async function runHistoryRepositoryConformance(
  createRepo: () => HistoryRepository,
): Promise<ConformanceResult[]> {
  const results: ConformanceResult[] = [];

  function ok(name: string, passed: boolean, message = ''): void {
    results.push({ passed, message: passed ? `${name}: ok` : `${name}: ${message}` });
  }

  // 1) list empty initially
  {
    const repo = createRepo();
    const list = await repo.list();
    ok('list empty initially', Array.isArray(list) && list.length === 0, `got length ${list.length}`);
  }

  // 2) add then list
  {
    const repo = createRepo();
    const entry = makeHistoryEntry({ id: 'h1' });
    await repo.add(entry);
    const list = await repo.list();
    ok('add then list', list.length === 1 && list[0].id === 'h1', `got ${JSON.stringify(list)}`);
  }

  // 3) add preserves order (append)
  {
    const repo = createRepo();
    const a = makeHistoryEntry({ id: 'a' });
    const b = makeHistoryEntry({ id: 'b' });
    await repo.add(a);
    await repo.add(b);
    const list = await repo.list();
    ok('add preserves order', list.length === 2 && list[0].id === 'a' && list[1].id === 'b', `got ${list.map((x) => x.id).join(',')}`);
  }

  // 4) remove deletes by id
  {
    const repo = createRepo();
    const a = makeHistoryEntry({ id: 'a' });
    const b = makeHistoryEntry({ id: 'b' });
    await repo.add(a);
    await repo.add(b);
    await repo.remove('a');
    const list = await repo.list();
    ok('remove deletes by id', list.length === 1 && list[0].id === 'b', `got ${JSON.stringify(list)}`);
  }

  // 5) remove non-existent is no-op
  {
    const repo = createRepo();
    const a = makeHistoryEntry({ id: 'a' });
    await repo.add(a);
    await repo.remove('nonexistent');
    const list = await repo.list();
    ok('remove non-existent is no-op', list.length === 1, `got ${list.length}`);
  }

  // 6) clear empties all
  {
    const repo = createRepo();
    await repo.add(makeHistoryEntry({ id: 'x' }));
    await repo.add(makeHistoryEntry({ id: 'y' }));
    await repo.clear();
    const list = await repo.list();
    ok('clear empties all', list.length === 0, `got ${list.length}`);
  }

  // 7) history entries survive round-trip with prompt content
  {
    const repo = createRepo();
    const entry: HistoryEntry = {
      id: 'full',
      createdAt: new Date().toISOString(),
      transcript: 'fix the login bug',
      prompt: {
        taskType: 'bug',
        markdown: '## Bug: login fails\nSteps...',
        sourceTranscript: 'fix the login bug',
      },
    };
    await repo.add(entry);
    const list = await repo.list();
    ok(
      'entry prompt round-trips',
      list.length === 1 &&
        list[0].prompt.taskType === 'bug' &&
        list[0].prompt.markdown === entry.prompt.markdown,
      `got ${JSON.stringify(list[0])}`,
    );
  }

  return results;
}

export async function runAllConformance(
  createSettingsRepo: () => SettingsRepository,
  createHistoryRepo: () => HistoryRepository,
): Promise<ConformanceResult[]> {
  const a = await runSettingsRepositoryConformance(createSettingsRepo);
  const b = await runHistoryRepositoryConformance(createHistoryRepo);
  return [...a, ...b];
}

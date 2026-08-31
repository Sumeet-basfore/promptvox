import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DEFAULT_SETTINGS } from '@promptvox/core';
import { DesktopSettingsRepository, DesktopHistoryRepository } from './index.js';

// Setup window object for Tauri API in Node environment
(globalThis as unknown as { window: unknown }).window = globalThis;

// Mock state for Tauri IPC invoke
let mockSettingsData: string | null = null;
let mockHistoryStore: Array<{
  id: string;
  created_at: string;
  transcript: string;
  prompt: { task_type: string; markdown: string; source_transcript: string };
}> = [];

describe('Desktop Storage Repositories (IPC layer)', () => {
  beforeEach(() => {
    mockSettingsData = null;
    mockHistoryStore = [];
  });

  it('DesktopSettingsRepository handles get, set, and default fallback', async () => {
    const mockInvoke = async (cmd: string, args?: Record<string, unknown>): Promise<unknown> => {
      if (cmd === 'get_settings') {
        return mockSettingsData;
      }
      if (cmd === 'set_settings') {
        mockSettingsData = args?.data as string;
        return;
      }
      throw new Error(`Unknown command: ${cmd}`);
    };

    (globalThis as unknown as { __TAURI_INTERNALS__: unknown }).__TAURI_INTERNALS__ = {
      invoke: mockInvoke,
    };

    const repo = new DesktopSettingsRepository();
    const initial = await repo.get();
    assert.deepStrictEqual(initial, DEFAULT_SETTINGS);

    const newSettings = {
      stt: { provider: 'openai' as const, apiKey: 'desktop-stt-key' },
      llm: { provider: 'openai' as const, apiKey: 'desktop-llm-key', model: 'gpt-4o' },
    };
    await repo.set(newSettings);

    const fetched = await repo.get();
    assert.strictEqual(fetched.stt.apiKey, 'desktop-stt-key');
    assert.strictEqual(fetched.llm.model, 'gpt-4o');
  });

  it('DesktopHistoryRepository handles list, add, remove, and clear', async () => {
    const mockInvoke = async (cmd: string, args?: Record<string, unknown>): Promise<unknown> => {
      if (cmd === 'list_history') {
        return mockHistoryStore;
      }
      if (cmd === 'add_history') {
        const entry = args?.entry as (typeof mockHistoryStore)[0];
        mockHistoryStore = [entry, ...mockHistoryStore.filter((e) => e.id !== entry.id)];
        return;
      }
      if (cmd === 'remove_history') {
        const id = args?.id as string;
        mockHistoryStore = mockHistoryStore.filter((e) => e.id !== id);
        return;
      }
      if (cmd === 'clear_history') {
        mockHistoryStore = [];
        return;
      }
      throw new Error(`Unknown command: ${cmd}`);
    };

    (globalThis as unknown as { __TAURI_INTERNALS__: unknown }).__TAURI_INTERNALS__ = {
      invoke: mockInvoke,
    };

    const repo = new DesktopHistoryRepository();
    const emptyList = await repo.list();
    assert.strictEqual(emptyList.length, 0);

    const sampleEntry = {
      id: 'desktop-hist-1',
      createdAt: '2026-08-31T20:00:00Z',
      transcript: 'desktop prompt transcription',
      prompt: {
        taskType: 'bug' as const,
        markdown: '# Bug report\nFix desktop storage',
        sourceTranscript: 'desktop prompt transcription',
      },
    };

    await repo.add(sampleEntry);
    const listAfterAdd = await repo.list();
    assert.strictEqual(listAfterAdd.length, 1);
    assert.strictEqual(listAfterAdd[0].id, 'desktop-hist-1');
    assert.strictEqual(listAfterAdd[0].prompt.taskType, 'bug');

    await repo.remove('desktop-hist-1');
    const listAfterRemove = await repo.list();
    assert.strictEqual(listAfterRemove.length, 0);
  });
});

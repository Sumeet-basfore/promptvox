import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  verifySettingsRepository,
  verifyHistoryRepository,
  DEFAULT_SETTINGS,
  type Settings,
  type SettingsRepository,
  type HistoryRepository,
  type HistoryEntry,
} from '../index.js';
import {
  ExtensionSettingsRepository,
  ExtensionHistoryRepository,
} from '../../../../apps/extension/src/storage/index.js';

// Mock in-memory storage for chrome.storage.local
function createMockChromeStorage() {
  const store = new Map<string, string>();
  return {
    storage: {
      local: {
        get: async (key: string) => {
          return { [key]: store.get(key) };
        },
        set: async (items: Record<string, string>) => {
          for (const [k, v] of Object.entries(items)) {
            store.set(k, v);
          }
        },
      },
    },
  };
}

describe('Storage Conformance Suite (@promptvox/core & extension)', () => {
  it('verifySettingsRepository passes for in-memory implementation', async () => {
    let currentSettings: Settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    const repo: SettingsRepository = {
      async get() {
        return JSON.parse(JSON.stringify(currentSettings));
      },
      async set(s: Settings) {
        currentSettings = JSON.parse(JSON.stringify(s));
      },
    };
    const passed = await verifySettingsRepository(repo);
    assert.strictEqual(passed, true, 'Settings repository conformance check should pass');
  });

  it('verifyHistoryRepository passes for in-memory implementation', async () => {
    let history: HistoryEntry[] = [];
    const repo: HistoryRepository = {
      async list() {
        return [...history];
      },
      async add(entry: HistoryEntry) {
        history = [entry, ...history.filter((e) => e.id !== entry.id)];
      },
      async remove(id: string) {
        history = history.filter((e) => e.id !== id);
      },
      async clear() {
        history = [];
      },
    };
    const passed = await verifyHistoryRepository(repo);
    assert.strictEqual(passed, true, 'History repository conformance check should pass');
  });

  it('ExtensionSettingsRepository passes verifySettingsRepository using chrome.storage.local', async () => {
    (globalThis as unknown as { chrome: unknown }).chrome = createMockChromeStorage();
    const repo = new ExtensionSettingsRepository();
    const passed = await verifySettingsRepository(repo);
    assert.strictEqual(passed, true, 'ExtensionSettingsRepository conformance check should pass');
  });

  it('ExtensionHistoryRepository passes verifyHistoryRepository using chrome.storage.local', async () => {
    (globalThis as unknown as { chrome: unknown }).chrome = createMockChromeStorage();
    const repo = new ExtensionHistoryRepository();
    const passed = await verifyHistoryRepository(repo);
    assert.strictEqual(passed, true, 'ExtensionHistoryRepository conformance check should pass');
  });
});

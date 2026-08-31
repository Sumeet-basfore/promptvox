import {
  DEFAULT_SETTINGS,
  type HistoryEntry,
  type HistoryRepository,
  type Settings,
  type SettingsRepository,
} from '@promptvox/core';

const SETTINGS_KEY = 'promptvox_settings';
const HISTORY_KEY = 'promptvox_history';

export class ExtensionSettingsRepository implements SettingsRepository {
  async get(): Promise<Settings> {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return DEFAULT_SETTINGS;
    }
    const result = await chrome.storage.local.get(SETTINGS_KEY);
    if (!result[SETTINGS_KEY]) {
      return DEFAULT_SETTINGS;
    }
    try {
      return JSON.parse(result[SETTINGS_KEY]) as Settings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async set(settings: Settings): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return;
    }
    await chrome.storage.local.set({
      [SETTINGS_KEY]: JSON.stringify(settings),
    });
  }
}

export class ExtensionHistoryRepository implements HistoryRepository {
  async list(): Promise<HistoryEntry[]> {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return [];
    }
    const result = await chrome.storage.local.get(HISTORY_KEY);
    if (!result[HISTORY_KEY]) {
      return [];
    }
    try {
      return JSON.parse(result[HISTORY_KEY]) as HistoryEntry[];
    } catch {
      return [];
    }
  }

  async add(entry: HistoryEntry): Promise<void> {
    const history = await this.list();
    const updated = [entry, ...history.filter((e) => e.id !== entry.id)];
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({
        [HISTORY_KEY]: JSON.stringify(updated),
      });
    }
  }

  async remove(id: string): Promise<void> {
    const history = await this.list();
    const updated = history.filter((e) => e.id !== id);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({
        [HISTORY_KEY]: JSON.stringify(updated),
      });
    }
  }

  async clear(): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({
        [HISTORY_KEY]: JSON.stringify([]),
      });
    }
  }
}

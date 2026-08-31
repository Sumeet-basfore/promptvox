import {
  parseHistoryJson,
  validateHistoryEntries,
  validateHistoryEntry,
  type HistoryEntry,
  type HistoryRepository,
} from '@promptvox/core';
import { HISTORY_KEY } from './keys';

/**
 * HistoryRepository backed by chrome.storage.local.
 * - Serializes HistoryEntry[] as JSON under HISTORY_KEY.
 * - Handles missing/corrupt JSON gracefully (returns [] or filtered valid entries).
 * - Validates entries at read and write boundaries.
 */
export class ExtensionHistoryRepository implements HistoryRepository {
  async list(): Promise<HistoryEntry[]> {
    try {
      const raw = await this.readRaw();
      if (raw === null) return [];
      if (typeof raw === 'string') {
        return parseHistoryJson(raw);
      }
      if (Array.isArray(raw)) {
        return validateHistoryEntries(raw);
      }
      return [];
    } catch {
      return [];
    }
  }

  async add(entry: HistoryEntry): Promise<void> {
    const validated = validateHistoryEntry(entry);
    if (validated === null) {
      throw new Error('Invalid history entry');
    }
    const current = await this.list();
    current.push(validated);
    await this.writeRaw(JSON.stringify(current));
  }

  async remove(id: string): Promise<void> {
    const current = await this.list();
    const filtered = current.filter((e) => e.id !== id);
    // Only write if something changed to reduce storage churn, but still ensure persistence
    if (filtered.length !== current.length) {
      await this.writeRaw(JSON.stringify(filtered));
    }
  }

  async clear(): Promise<void> {
    await this.writeRaw(JSON.stringify([]));
  }

  private readRaw(): Promise<string | unknown[] | null> {
    return new Promise((resolve) => {
      const storage = getChromeStorage();
      if (!storage) {
        resolve(null);
        return;
      }
      storage.get([HISTORY_KEY], (result: Record<string, unknown>) => {
        const lastError = getLastError();
        if (lastError) {
          resolve(null);
          return;
        }
        const value = result[HISTORY_KEY];
        if (value === undefined || value === null) {
          resolve(null);
        } else {
          resolve(value as string | unknown[]);
        }
      });
    });
  }

  private writeRaw(json: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const storage = getChromeStorage();
      if (!storage) {
        resolve();
        return;
      }
      storage.set({ [HISTORY_KEY]: json }, () => {
        const lastError = getLastError();
        if (lastError) {
          reject(new Error('Failed to persist history'));
          return;
        }
        resolve();
      });
    });
  }
}

function getChromeStorage(): {
  get: (keys: string[], cb: (r: Record<string, unknown>) => void) => void;
  set: (items: Record<string, string>, cb: () => void) => void;
} | null {
  const g = globalThis as unknown as { chrome?: { storage?: { local?: unknown } } };
  const local = g.chrome?.storage?.local;
  if (
    local !== null &&
    typeof local === 'object' &&
    typeof (local as { get?: unknown }).get === 'function' &&
    typeof (local as { set?: unknown }).set === 'function'
  ) {
    return local as {
      get: (keys: string[], cb: (r: Record<string, unknown>) => void) => void;
      set: (items: Record<string, string>, cb: () => void) => void;
    };
  }
  return null;
}

function getLastError(): string | null {
  const g = globalThis as unknown as { chrome?: { runtime?: { lastError?: { message?: string } } } };
  return g.chrome?.runtime?.lastError?.message ?? null;
}

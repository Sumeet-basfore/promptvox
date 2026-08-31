import {
  DEFAULT_SETTINGS,
  parseSettingsJson,
  validateSettings,
  type Settings,
  type SettingsRepository,
} from '@promptvox/core';
import { SETTINGS_KEY } from './keys';

/**
 * SettingsRepository backed by chrome.storage.local.
 * - Serializes Settings as JSON under SETTINGS_KEY.
 * - Validates at the storage boundary; corrupt/missing JSON returns defaults.
 * - API keys are never logged or included in errors.
 */
export class ExtensionSettingsRepository implements SettingsRepository {
  async get(): Promise<Settings> {
    try {
      const raw = await this.readRaw();
      if (raw === null) {
        return structuredClone(DEFAULT_SETTINGS);
      }
      // raw may already be an object if something wrote without JSON.stringify
      // Handle both cases: string (expected) and object (legacy/direct write)
      if (typeof raw === 'string') {
        return parseSettingsJson(raw);
      }
      if (typeof raw === 'object' && raw !== null) {
        return validateSettings(raw);
      }
      return structuredClone(DEFAULT_SETTINGS);
    } catch {
      return structuredClone(DEFAULT_SETTINGS);
    }
  }

  async set(settings: Settings): Promise<void> {
    // Validate at boundary before persisting — never trust caller input blindly
    const validated = validateSettings(settings);
    const json = JSON.stringify(validated);
    await this.writeRaw(json);
  }

  private readRaw(): Promise<string | Record<string, unknown> | null> {
    return new Promise((resolve) => {
      // Use chrome.storage.local; WXT / MV3 guarantees availability in extension contexts.
      // Gracefully handle absence (e.g. outside extension context during tests).
      const storage = getChromeStorage();
      if (!storage) {
        resolve(null);
        return;
      }
      storage.get([SETTINGS_KEY], (result: Record<string, unknown>) => {
        const lastError = getLastError();
        if (lastError) {
          resolve(null);
          return;
        }
        const value = result[SETTINGS_KEY];
        if (value === undefined || value === null) {
          resolve(null);
        } else {
          resolve(value as string | Record<string, unknown>);
        }
      });
    });
  }

  private writeRaw(json: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const storage = getChromeStorage();
      if (!storage) {
        // In non-extension contexts (tests), resolve as no-op to keep interface usable
        resolve();
        return;
      }
      storage.set({ [SETTINGS_KEY]: json }, () => {
        const lastError = getLastError();
        if (lastError) {
          // Do not include settings/json in error message (API keys)
          reject(new Error('Failed to persist settings'));
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

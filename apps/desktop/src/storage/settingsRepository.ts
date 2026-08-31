import {
  DEFAULT_SETTINGS,
  parseSettingsJson,
  validateSettings,
  type Settings,
  type SettingsRepository,
} from '@promptvox/core';
import { invoke } from '@tauri-apps/api/core';

/**
 * Desktop SettingsRepository — thin wrapper over Rust SQLite via Tauri commands.
 * - Rust owns the SQLite file in the app data dir (promptvox.db).
 * - Frontend never touches SQL directly; only typed invoke calls.
 * - Validates at boundary; corrupt/missing JSON returns defaults.
 */
export class DesktopSettingsRepository implements SettingsRepository {
  async get(): Promise<Settings> {
    try {
      const raw = await invoke<Settings>('get_settings');
      // Validate even though Rust already normalized — defense in depth
      return validateSettings(raw);
    } catch {
      // Fallback for non-Tauri contexts (e.g. vite dev without backend)
      // Try to fall back to parsing if invoke failed due to missing backend.
      // Return defaults to keep UI usable.
      return structuredClone(DEFAULT_SETTINGS);
    }
  }

  async set(settings: Settings): Promise<void> {
    // Validate before sending over IPC — never transmit unchecked shapes.
    // Do not log settings (API keys).
    const validated = validateSettings(settings);
    try {
      await invoke('set_settings', { settings: validated });
    } catch {
      // Do not include settings in error
      throw new Error('Failed to persist settings');
    }
  }

  /**
   * Helper for testing: parse raw JSON string via core validation (exposed for conformance).
   * Not used in production path which goes through Rust.
   */
  static parseJson(json: string | null | undefined): Settings {
    return parseSettingsJson(json);
  }
}

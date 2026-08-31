import {
  validateHistoryEntries,
  validateHistoryEntry,
  type HistoryEntry,
  type HistoryRepository,
} from '@promptvox/core';
import { invoke } from '@tauri-apps/api/core';

/**
 * Desktop HistoryRepository — thin wrapper over Rust SQLite via Tauri commands.
 * - Rust owns the SQLite `history` table (id, created_at, transcript, prompt_json).
 * - Frontend never executes SQL; only typed invoke calls.
 */
export class DesktopHistoryRepository implements HistoryRepository {
  async list(): Promise<HistoryEntry[]> {
    try {
      const raw = await invoke<HistoryEntry[]>('list_history');
      // Defense in depth: validate entries returned from Rust
      return validateHistoryEntries(raw);
    } catch {
      return [];
    }
  }

  async add(entry: HistoryEntry): Promise<void> {
    const validated = validateHistoryEntry(entry);
    if (validated === null) {
      throw new Error('Invalid history entry');
    }
    try {
      await invoke('add_history', { entry: validated });
    } catch {
      throw new Error('Failed to persist history entry');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await invoke('remove_history', { id });
    } catch {
      throw new Error('Failed to remove history entry');
    }
  }

  async clear(): Promise<void> {
    try {
      await invoke('clear_history');
    } catch {
      throw new Error('Failed to clear history');
    }
  }
}

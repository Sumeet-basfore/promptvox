import { invoke } from '@tauri-apps/api/core';
import {
  DEFAULT_SETTINGS,
  type HistoryEntry,
  type HistoryRepository,
  type Settings,
  type SettingsRepository,
  type TaskType,
} from '@promptvox/core';

interface HistoryEntryDto {
  id: string;
  created_at: string;
  transcript: string;
  prompt: {
    task_type: string;
    markdown: string;
    source_transcript: string;
  };
}

export class DesktopSettingsRepository implements SettingsRepository {
  async get(): Promise<Settings> {
    try {
      const data = await invoke<string | null>('get_settings');
      if (!data) {
        return DEFAULT_SETTINGS;
      }
      return JSON.parse(data) as Settings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async set(settings: Settings): Promise<void> {
    await invoke('set_settings', { data: JSON.stringify(settings) });
  }
}

export class DesktopHistoryRepository implements HistoryRepository {
  async list(): Promise<HistoryEntry[]> {
    try {
      const dtos = await invoke<HistoryEntryDto[]>('list_history');
      return dtos.map((d) => ({
        id: d.id,
        createdAt: d.created_at,
        transcript: d.transcript,
        prompt: {
          taskType: d.prompt.task_type as TaskType,
          markdown: d.prompt.markdown,
          sourceTranscript: d.prompt.source_transcript,
        },
      }));
    } catch {
      return [];
    }
  }

  async add(entry: HistoryEntry): Promise<void> {
    const dto: HistoryEntryDto = {
      id: entry.id,
      created_at: entry.createdAt,
      transcript: entry.transcript,
      prompt: {
        task_type: entry.prompt.taskType,
        markdown: entry.prompt.markdown,
        source_transcript: entry.prompt.sourceTranscript,
      },
    };
    await invoke('add_history', { entry: dto });
  }

  async remove(id: string): Promise<void> {
    await invoke('remove_history', { id });
  }

  async clear(): Promise<void> {
    await invoke('clear_history');
  }
}

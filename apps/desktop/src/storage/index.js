import { invoke } from '@tauri-apps/api/core';
import { DEFAULT_SETTINGS, } from '@promptvox/core';
export class DesktopSettingsRepository {
    async get() {
        try {
            const data = await invoke('get_settings');
            if (!data) {
                return DEFAULT_SETTINGS;
            }
            return JSON.parse(data);
        }
        catch {
            return DEFAULT_SETTINGS;
        }
    }
    async set(settings) {
        await invoke('set_settings', { data: JSON.stringify(settings) });
    }
}
export class DesktopHistoryRepository {
    async list() {
        try {
            const dtos = await invoke('list_history');
            return dtos.map((d) => ({
                id: d.id,
                createdAt: d.created_at,
                transcript: d.transcript,
                prompt: {
                    taskType: d.prompt.task_type,
                    markdown: d.prompt.markdown,
                    sourceTranscript: d.prompt.source_transcript,
                },
            }));
        }
        catch {
            return [];
        }
    }
    async add(entry) {
        const dto = {
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
    async remove(id) {
        await invoke('remove_history', { id });
    }
    async clear() {
        await invoke('clear_history');
    }
}
//# sourceMappingURL=index.js.map
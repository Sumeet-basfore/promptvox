import type { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  stt: {
    provider: 'local',
  },
  llm: {
    provider: 'local',
    endpoint: 'http://localhost:8080/v1',
  },
};

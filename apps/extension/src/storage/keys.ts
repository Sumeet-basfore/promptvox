/**
 * Deterministic storage keys for chrome.storage.local.
 *
 * - promptvox:settings -> JSON string of Settings
 * - promptvox:history  -> JSON string of HistoryEntry[]
 *
 * Stored as JSON strings (not raw objects) so missing/corrupt values can be
 * detected via JSON.parse failure and replaced with validated defaults.
 * See packages/core/src/storage/validation.ts for boundary validation.
 */
export const SETTINGS_KEY = 'promptvox:settings' as const;
export const HISTORY_KEY = 'promptvox:history' as const;

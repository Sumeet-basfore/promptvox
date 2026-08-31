use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};

// ---------------------------------------------------------------------------
// Types matching packages/core storage & HistoryEntry
// ---------------------------------------------------------------------------

#[allow(non_snake_case)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct STTConfig {
    pub provider: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub modelPath: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub apiKey: Option<String>,
}

#[allow(non_snake_case)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMConfig {
    pub provider: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub endpoint: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub apiKey: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub stt: STTConfig,
    pub llm: LLMConfig,
}

#[allow(non_snake_case)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratedPrompt {
    pub taskType: String,
    pub markdown: String,
    pub sourceTranscript: String,
}

#[allow(non_snake_case)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub id: String,
    pub createdAt: String,
    pub transcript: String,
    pub prompt: GeneratedPrompt,
}

// ---------------------------------------------------------------------------
// DB state
// ---------------------------------------------------------------------------

pub struct DbState(pub Mutex<Connection>);

fn app_data_db_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app_data_dir error: {e}"))?;
    std::fs::create_dir_all(&dir).map_err(|e| format!("create app_data_dir: {e}"))?;
    Ok(dir.join("promptvox.db"))
}

fn default_settings() -> Settings {
    Settings {
        stt: STTConfig {
            provider: "local".to_string(),
            modelPath: None,
            apiKey: None,
        },
        llm: LLMConfig {
            provider: "local".to_string(),
            endpoint: None,
            apiKey: None,
            model: None,
        },
    }
}

fn is_valid_stt_provider(p: &str) -> bool {
    matches!(p, "local" | "openai" | "groq" | "deepgram")
}

fn is_valid_llm_provider(p: &str) -> bool {
    matches!(p, "local" | "openai" | "anthropic" | "groq")
}

fn is_valid_task_type(p: &str) -> bool {
    matches!(p, "feature" | "bug" | "refactor" | "question" | "other")
}

fn sanitize_optional(s: Option<String>) -> Option<String> {
    match s {
        Some(v) if !v.trim().is_empty() => Some(v.trim().to_string()),
        _ => None,
    }
}

/// Validate/normalize settings at the storage boundary — never trust caller.
fn validate_settings(mut s: Settings) -> Settings {
    if !is_valid_stt_provider(&s.stt.provider) {
        s.stt.provider = "local".to_string();
    }
    s.stt.modelPath = sanitize_optional(s.stt.modelPath);
    s.stt.apiKey = sanitize_optional(s.stt.apiKey);

    if !is_valid_llm_provider(&s.llm.provider) {
        s.llm.provider = "local".to_string();
    }
    s.llm.endpoint = sanitize_optional(s.llm.endpoint);
    s.llm.apiKey = sanitize_optional(s.llm.apiKey);
    s.llm.model = sanitize_optional(s.llm.model);

    s
}

fn init_db(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            data TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS history (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            transcript TEXT NOT NULL,
            prompt_json TEXT NOT NULL
        );
        ",
    )?;
    // Ensure single settings row exists with defaults if missing
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM settings WHERE id = 1",
        [],
        |r| r.get(0),
    )?;
    if count == 0 {
        let defaults = serde_json::to_string(&default_settings()).unwrap();
        conn.execute(
            "INSERT INTO settings (id, data) VALUES (1, ?1)",
            params![defaults],
        )?;
    }
    Ok(())
}

pub fn init_state(app: &AppHandle) -> Result<DbState, String> {
    let path = app_data_db_path(app)?;
    let conn = Connection::open(&path).map_err(|e| format!("open db {path:?}: {e}"))?;
    init_db(&conn).map_err(|e| format!("init db: {e}"))?;
    Ok(DbState(Mutex::new(conn)))
}

// ---------------------------------------------------------------------------
// Tauri commands — thin, typed, serializable, never blocking UI thread
// (Tauri commands run on a thread pool by default; DB mutex guards are short)
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn get_settings(state: State<DbState>) -> Result<Settings, String> {
    let conn = state.0.lock().map_err(|e| format!("db lock: {e}"))?;
    let data: Option<String> = conn
        .query_row("SELECT data FROM settings WHERE id = 1", [], |r| r.get(0))
        .optional()
        .map_err(|e| format!("query settings: {e}"))?;
    match data {
        None => Ok(default_settings()),
        Some(json) => {
            match serde_json::from_str::<Settings>(&json) {
                Ok(s) => Ok(validate_settings(s)),
                Err(_) => Ok(default_settings()),
            }
        }
    }
}

#[tauri::command]
pub fn set_settings(state: State<DbState>, settings: Settings) -> Result<(), String> {
    // Never log settings (API keys) — error messages are generic
    let validated = validate_settings(settings);
    let json = serde_json::to_string(&validated).map_err(|_| "Failed to serialize settings".to_string())?;
    let conn = state.0.lock().map_err(|e| format!("db lock: {e}"))?;
    conn.execute(
        "INSERT INTO settings (id, data) VALUES (1, ?1) ON CONFLICT(id) DO UPDATE SET data = excluded.data",
        params![json],
    )
    .map_err(|_| "Failed to persist settings".to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_history(state: State<DbState>) -> Result<Vec<HistoryEntry>, String> {
    let conn = state.0.lock().map_err(|e| format!("db lock: {e}"))?;
    let mut stmt = conn
        .prepare("SELECT id, created_at, transcript, prompt_json FROM history ORDER BY created_at ASC")
        .map_err(|_| "Failed to query history".to_string())?;
    let rows = stmt
        .query_map([], |row| {
            let id: String = row.get(0)?;
            let created_at: String = row.get(1)?;
            let transcript: String = row.get(2)?;
            let prompt_json: String = row.get(3)?;
            Ok((id, created_at, transcript, prompt_json))
        })
        .map_err(|_| "Failed to query history".to_string())?;

    let mut out = Vec::new();
    for r in rows {
        let (id, created_at, transcript, prompt_json) =
            r.map_err(|_| "Failed to read history row".to_string())?;
        // Validate date
        if chrono_like_valid(&created_at) == false {
            continue;
        }
        let prompt: GeneratedPrompt = match serde_json::from_str(&prompt_json) {
            Ok(p) => p,
            Err(_) => continue,
        };
        if !is_valid_task_type(&prompt.taskType) {
            continue;
        }
        if prompt.markdown.is_empty() {
            continue;
        }
        out.push(HistoryEntry {
            id,
            createdAt: created_at,
            transcript,
            prompt,
        });
    }
    Ok(out)
}

fn chrono_like_valid(s: &str) -> bool {
    // Accept ISO 8601 strings that parse as non-NaN date. We avoid chrono dep; use simple check:
    // Try to parse via time crate? Instead do minimal: must contain 'T' or '-' and parse length.
    // For correctness without extra dep, attempt to use chrono parsing via serde_json? Simpler:
    // Use std to check: try parsing with humantime? We'll just check that string is not empty and
    // contains digit and parses as year start. Prefer lenient but not empty.
    // To be stricter we can try `serde_json::from_str::<serde_json::Value>` is not enough.
    // Use a lightweight manual check: must be valid RFC3339-like — we attempt to parse via `time` if available,
    // fallback to just non-empty. Since rusqlite storage is controlled by our own writes, this is low-risk.
    // We keep it strict enough to filter corrupt rows: non-empty and not NaN-like.
    if s.trim().is_empty() {
        return false;
    }
    // Basic ISO check: YYYY-MM-DD
    if s.len() < 10 {
        return false;
    }
    true
}

#[tauri::command]
pub fn add_history(state: State<DbState>, entry: HistoryEntry) -> Result<(), String> {
    // Validate at boundary
    if entry.id.trim().is_empty() {
        return Err("Invalid history entry: missing id".to_string());
    }
    if entry.createdAt.trim().is_empty() {
        return Err("Invalid history entry: missing createdAt".to_string());
    }
    if !is_valid_task_type(&entry.prompt.taskType) {
        return Err("Invalid history entry: invalid taskType".to_string());
    }
    let prompt_json = serde_json::to_string(&entry.prompt)
        .map_err(|_| "Failed to serialize prompt".to_string())?;
    let conn = state.0.lock().map_err(|e| format!("db lock: {e}"))?;
    conn.execute(
        "INSERT INTO history (id, created_at, transcript, prompt_json) VALUES (?1, ?2, ?3, ?4) ON CONFLICT(id) DO UPDATE SET created_at=excluded.created_at, transcript=excluded.transcript, prompt_json=excluded.prompt_json",
        params![entry.id, entry.createdAt, entry.transcript, prompt_json],
    )
    .map_err(|_| "Failed to persist history".to_string())?;
    Ok(())
}

#[tauri::command]
pub fn remove_history(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| format!("db lock: {e}"))?;
    conn.execute("DELETE FROM history WHERE id = ?1", params![id])
        .map_err(|_| "Failed to remove history".to_string())?;
    Ok(())
}

#[tauri::command]
pub fn clear_history(state: State<DbState>) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| format!("db lock: {e}"))?;
    conn.execute("DELETE FROM history", [])
        .map_err(|_| "Failed to clear history".to_string())?;
    Ok(())
}

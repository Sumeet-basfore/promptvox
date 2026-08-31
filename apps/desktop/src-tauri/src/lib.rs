use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};

struct DbState {
    conn: Mutex<Connection>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GeneratedPromptDto {
    pub task_type: String,
    pub markdown: String,
    pub source_transcript: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HistoryEntryDto {
    pub id: String,
    pub created_at: String,
    pub transcript: String,
    pub prompt: GeneratedPromptDto,
}

fn get_db_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app_data_dir: {}", e))?;
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create dir: {}", e))?;
    Ok(dir.join("promptvox.db"))
}

fn init_db(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            data TEXT NOT NULL
        )",
        [],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS history (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            transcript TEXT NOT NULL,
            prompt TEXT NOT NULL
        )",
        [],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_settings(state: State<'_, DbState>) -> Result<Option<String>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT data FROM settings WHERE id = 1")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query([]).map_err(|e| e.to_string())?;

    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let data: String = row.get(0).map_err(|e| e.to_string())?;
        Ok(Some(data))
    } else {
        Ok(None)
    }
}

#[tauri::command]
fn set_settings(data: String, state: State<'_, DbState>) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO settings (id, data) VALUES (1, ?1)
         ON CONFLICT(id) DO UPDATE SET data = ?1",
        params![data],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn list_history(state: State<'_, DbState>) -> Result<Vec<HistoryEntryDto>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, created_at, transcript, prompt FROM history ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let history_iter = stmt
        .query_map([], |row| {
            let id: String = row.get(0)?;
            let created_at: String = row.get(1)?;
            let transcript: String = row.get(2)?;
            let prompt_json: String = row.get(3)?;
            let prompt: GeneratedPromptDto = serde_json::from_str(&prompt_json).unwrap_or(GeneratedPromptDto {
                task_type: "other".into(),
                markdown: "".into(),
                source_transcript: "".into(),
            });
            Ok(HistoryEntryDto {
                id,
                created_at,
                transcript,
                prompt,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut entries = Vec::new();
    for entry in history_iter {
        entries.push(entry.map_err(|e| e.to_string())?);
    }
    Ok(entries)
}

#[tauri::command]
fn add_history(entry: HistoryEntryDto, state: State<'_, DbState>) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let prompt_json = serde_json::to_string(&entry.prompt).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO history (id, created_at, transcript, prompt) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(id) DO UPDATE SET created_at = ?2, transcript = ?3, prompt = ?4",
        params![entry.id, entry.created_at, entry.transcript, prompt_json],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn remove_history(id: String, state: State<'_, DbState>) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM history WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn clear_history(state: State<'_, DbState>) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM history", [])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let db_path = get_db_path(app.handle())?;
            let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;
            init_db(&conn)?;
            app.manage(DbState {
                conn: Mutex::new(conn),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_settings,
            set_settings,
            list_history,
            add_history,
            remove_history,
            clear_history
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
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
            let prompt: GeneratedPromptDto =
                serde_json::from_str(&prompt_json).unwrap_or(GeneratedPromptDto {
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sqlite_settings_schema_and_operations() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).expect("init_db should succeed");

        let state = DbState {
            conn: Mutex::new(conn),
        };
        let conn_guard = state.conn.lock().unwrap();

        // Query initial settings when table is empty
        {
            let mut stmt = conn_guard
                .prepare("SELECT data FROM settings WHERE id = 1")
                .unwrap();
            let mut rows = stmt.query([]).unwrap();
            assert!(rows.next().unwrap().is_none());
        }

        // Insert settings
        let settings_json = r#"{"stt":{"provider":"local"},"llm":{"provider":"local","endpoint":"http://localhost:8080/v1"}}"#;
        conn_guard.execute(
            "INSERT INTO settings (id, data) VALUES (1, ?1) ON CONFLICT(id) DO UPDATE SET data = ?1",
            params![settings_json],
        ).unwrap();

        let data: String = conn_guard
            .query_row(
                "SELECT data FROM settings WHERE id = 1",
                [],
                |r: &rusqlite::Row| r.get(0),
            )
            .unwrap();
        assert_eq!(data, settings_json);

        // Update settings (upsert behavior)
        let updated_json = r#"{"stt":{"provider":"openai","apiKey":"sk-test"},"llm":{"provider":"openai","apiKey":"sk-test","model":"gpt-4o"}}"#;
        conn_guard.execute(
            "INSERT INTO settings (id, data) VALUES (1, ?1) ON CONFLICT(id) DO UPDATE SET data = ?1",
            params![updated_json],
        ).unwrap();

        let data_updated: String = conn_guard
            .query_row(
                "SELECT data FROM settings WHERE id = 1",
                [],
                |r: &rusqlite::Row| r.get(0),
            )
            .unwrap();
        assert_eq!(data_updated, updated_json);
    }

    #[test]
    fn test_sqlite_history_crud_operations() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).expect("init_db should succeed");

        let state = DbState {
            conn: Mutex::new(conn),
        };
        let conn_guard = state.conn.lock().unwrap();

        // Count initially 0
        let count: i64 = conn_guard
            .query_row("SELECT COUNT(*) FROM history", [], |r: &rusqlite::Row| {
                r.get(0)
            })
            .unwrap();
        assert_eq!(count, 0);

        // Insert entry
        let prompt_dto = GeneratedPromptDto {
            task_type: "feature".to_string(),
            markdown: "# Feature Request\nAdd audio recording".to_string(),
            source_transcript: "Add audio recording".to_string(),
        };
        let prompt_json = serde_json::to_string(&prompt_dto).unwrap();

        conn_guard
            .execute(
                "INSERT INTO history (id, created_at, transcript, prompt) VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(id) DO UPDATE SET created_at = ?2, transcript = ?3, prompt = ?4",
                params![
                    "hist-1",
                    "2026-08-31T20:00:00Z",
                    "Add audio recording",
                    prompt_json
                ],
            )
            .unwrap();

        // Query back
        {
            let mut stmt = conn_guard.prepare("SELECT id, created_at, transcript, prompt FROM history ORDER BY created_at DESC").unwrap();
            let mut rows = stmt.query([]).unwrap();
            let row = rows.next().unwrap().expect("row present");
            let id: String = row.get(0).unwrap();
            let created_at: String = row.get(1).unwrap();
            let transcript: String = row.get(2).unwrap();
            let fetched_prompt_json: String = row.get(3).unwrap();

            assert_eq!(id, "hist-1");
            assert_eq!(created_at, "2026-08-31T20:00:00Z");
            assert_eq!(transcript, "Add audio recording");

            let fetched_prompt: GeneratedPromptDto =
                serde_json::from_str(&fetched_prompt_json).unwrap();
            assert_eq!(fetched_prompt.task_type, "feature");
            assert_eq!(
                fetched_prompt.markdown,
                "# Feature Request\nAdd audio recording"
            );
        }

        // Delete entry
        conn_guard
            .execute("DELETE FROM history WHERE id = ?1", params!["hist-1"])
            .unwrap();
        let count_after: i64 = conn_guard
            .query_row("SELECT COUNT(*) FROM history", [], |r: &rusqlite::Row| {
                r.get(0)
            })
            .unwrap();
        assert_eq!(count_after, 0);
    }
}

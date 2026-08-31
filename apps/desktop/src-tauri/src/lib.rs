mod storage;

use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .setup(|app| {
            let state = storage::init_state(&app.handle()).expect("failed to init storage db");
            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            storage::get_settings,
            storage::set_settings,
            storage::list_history,
            storage::add_history,
            storage::remove_history,
            storage::clear_history
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use tauri::Manager;


#[tauri::command]
fn open_devtools(app: tauri::AppHandle) {
  if let Some(window) = app.get_webview_window("main") {
    window.open_devtools();
  }
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![open_devtools])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

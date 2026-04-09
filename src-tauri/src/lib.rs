mod logger;
mod ylib;

use ylib::{ open_devtools, load_las_file, pick_file_path };
use logger::{get_logs, clear_logs, send_error_log, send_info_log, send_warn_log, send_debug_log};


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
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
    .invoke_handler(tauri::generate_handler![
        open_devtools, 
        get_logs, 
        clear_logs,
        send_error_log,
        send_info_log,
        send_warn_log,
        send_debug_log,
        load_las_file,
        pick_file_path,
        ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

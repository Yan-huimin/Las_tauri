use tauri::Manager;
mod logger;
mod pcl;

use logger::{get_logs, clear_logs, push_log, send_error_log, send_info_log, send_warn_log, send_debug_log};

// 打开开发者工具（调试用）
#[tauri::command]
fn open_devtools(app: tauri::AppHandle) {
  if let Some(window) = app.get_webview_window("main") {
    // push_log("error", "测试错误日志".to_string());
    // push_log("info", "测试信息日志".to_string());
    // push_log("warn", "测试警告日志".to_string());
    // push_log("debug", "测试调试日志".to_string());
    window.open_devtools();
    push_log("debug", "open devtools".to_string());
  }
}

// cxx测试
#[tauri::command]
fn get_point_cloud() {
    pcl::test_pcl();
    push_log("debug", "get point cloud".to_string());
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
    .invoke_handler(tauri::generate_handler![
        open_devtools, 
        get_logs, 
        clear_logs,
        send_error_log,
        send_info_log,
        send_warn_log,
        send_debug_log,
        get_point_cloud
        ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

mod logger;
mod process;
mod laslib;
mod data;

use process::{ open_devtools, load_las_file, pick_file_path, check_file_exists, load_las_info };
use logger::{get_logs, clear_logs, send_error_log, send_info_log, send_warn_log, send_debug_log};
use laslib::{ voxel_downsample_las, sor_filter_pro, denoise_las, save_las_file };

use crate::data::AppData;




#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .manage(AppData::default())
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
        load_las_info,
        pick_file_path,
        check_file_exists,
        voxel_downsample_las,
        sor_filter_pro,
        denoise_las,
        save_las_file,
        ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

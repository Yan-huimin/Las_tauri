use std::{path::PathBuf};
use tauri_plugin_dialog::DialogExt;
use las::Reader;
use serde::Serialize;
use tauri::Manager;
use crate::logger::{push_log};

// 打开开发者工具（调试用）
#[tauri::command]
pub fn open_devtools(app: tauri::AppHandle) {
  if let Some(window) = app.get_webview_window("main") {
    // push_log("error", "测试错误日志".to_string());
    // push_log("info", "测试信息日志".to_string());
    // push_log("warn", "测试警告日志".to_string());
    // push_log("debug", "测试调试日志".to_string());
    window.open_devtools();
    push_log("debug", "open devtools".to_string());
  }
}

#[derive(Serialize)]
pub struct PointCloudData {
    pub positions: Vec<f32>,
    pub colors: Vec<u8>,
    pub offset: [f64; 3],
}

// 文件选择器命令，返回用户选择的文件路径
#[tauri::command]
pub async fn pick_file_path(handle: tauri::AppHandle) -> Result<PathBuf, String> {
    // 使用 Tauri 官方 Dialog 插件，它是异步且非阻塞的
    let file_path = handle.dialog()
        .file()
        .add_filter("Point Cloud", &["las"])
        .set_title("选择点云文件")
        .blocking_pick_file(); // 在 async 环境中也可以使用，或者用 pick_file 并 await

    match file_path {
        Some(path) => {
            push_log("info", format!("load las file from : {}", path));
            path.into_path().map_err(|e| e.to_string())
        },
        None => {
            push_log("info", "user cancle choose file".to_string());
            Err("用户取消了选择".to_string())
        }
    }
}



#[tauri::command]
pub async fn load_las_file(path: String) -> Result<PointCloudData, String> {
    let mut reader = Reader::from_path(&path).map_err(|e| e.to_string())?;
    let header = reader.header().clone(); // 克隆 header 以便后续使用
    let num_points = header.number_of_points() as usize;

    if num_points == 0 {
        return Err("文件不包含任何点".into());
    }

    let max_points = 2_000_000;
    // 确保 step 至少为 1，防止除以 0 风险
    let step = (num_points / max_points).max(1);

    let bounds = header.bounds();
    let offset = [
        (bounds.min.x + bounds.max.x) / 2.0,
        (bounds.min.y + bounds.max.y) / 2.0,
        (bounds.min.z + bounds.max.z) / 2.0,
    ];

    let estimated_points = num_points / step;
    let mut positions = Vec::with_capacity(estimated_points * 3);
    let mut colors = Vec::with_capacity(estimated_points * 3);

    // 建议：如果 LAS 库支持按索引读取或批量读取，性能会更佳
    // 这里依然使用迭代器，但加入了简单的错误跳过处理
    for (index, point_result) in reader.points().enumerate() {
        if index % step == 0 {
            if let Ok(p) = point_result {
                // 确保在高精度下完成减法
                positions.push((p.x - offset[0]) as f32 );
                positions.push((p.y - offset[1]) as f32 );
                positions.push((p.z - offset[2]) as f32 );

                if let Some(color) = p.color {
                    colors.push((color.red >> 8) as u8);
                    colors.push((color.green >> 8) as u8);
                    colors.push((color.blue >> 8) as u8);
                } else {
                    colors.push(100);
                    colors.push(100);
                    colors.push(100);
                }
            }
        }
    }

    push_log("info", format!("load las file from : {}", path));

    Ok(PointCloudData {
        positions,
        colors,
        offset,
    })
}
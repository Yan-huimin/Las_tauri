use std::{ path::PathBuf };
use tauri_plugin_dialog::DialogExt;
use las::{Reader};
use serde::Serialize;
use tauri::{AppHandle, Manager};
use crate::logger::{push_log};
use std::path::Path;

#[tauri::command]
pub fn check_file_exists(path: String) -> bool {
    // 使用 Path 结构体检查路径是否存在，且必须是一个文件
    let path_buf = Path::new(&path);
    path_buf.exists() && path_buf.is_file()
}

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

#[derive(Serialize, Clone)]
pub struct PointCloudData {
    pub positions: Vec<f32>,
    pub colors: Vec<u8>,
    pub offset: [f64; 3],
}

#[derive(Serialize, Clone)]
pub struct LasInfo {
    pub x_max: f64, x_min: f64,
    pub y_max: f64, y_min: f64,
    pub z_max: f64, z_min: f64,
    pub total_count: i64,
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
pub async fn load_las_info(_app: AppHandle, path: String) -> Result<LasInfo, String> {
    let reader = Reader::from_path(&path).map_err(|e| e.to_string())?;
    let header = reader.header();

    // 获取点总数
    let total_count = header.number_of_points() as i64;
    
    // 获取边界信息
    let bounds = header.bounds();

    push_log("info", format!("load las info from {}", path));
    push_log("info", format!("Las file info: Point_Count {}", total_count));

    // 修正：确保 y 对应 .y，z 对应 .z
    Ok(LasInfo {
        x_max: bounds.max.x,
        x_min: bounds.min.x,
        y_max: bounds.max.y, 
        y_min: bounds.min.y,
        z_max: bounds.max.z,
        z_min: bounds.min.z,
        total_count: total_count,
    })
}

// 分段加载las数据点
#[tauri::command]
pub async fn load_las_file(_app: AppHandle, path: String) -> Result<PointCloudData, String> {
    // 打开 Reader
    let mut reader = Reader::from_path(path).map_err(|e| e.to_string())?;
    let header = reader.header();
    let num_points = header.number_of_points() as usize;

    // 抽稀控制逻辑
    // 前端展示上限控制在 200万 - 500万点
    let max_points = 2_000_000; 
    let step = if num_points > max_points {
        num_points / max_points
    } else {
        1
    };

    // 计算中心偏移 (Offset)
    let bounds = header.bounds();
    let offset = [
        (bounds.min.x + bounds.max.x) / 2.0,
        (bounds.min.y + bounds.max.y) / 2.0,
        (bounds.min.z + bounds.max.z) / 2.0,
    ];

    // 预分配内存 (根据实际采样后的点数分配，避免浪费)
    let estimated_points = num_points / step;
    let mut positions = Vec::with_capacity(estimated_points * 3);
    let mut colors = Vec::with_capacity(estimated_points * 3);

    push_log("info", format!("original points count: {}", num_points));
    push_log("info", format!("step length: {}", step));
    push_log("info", format!("rendered points count: {}", estimated_points));

    // 遍历点云 (使用 enumerate 进行步进判断)
    for (index, point) in reader.points().enumerate() {
        // 只有当索引能被 step 整除时才处理该点
        if index % step == 0 {
            let p = point.map_err(|e| e.to_string())?;
            
            // 坐标处理
            positions.push((p.x - offset[0]) as f32);
            positions.push((p.y - offset[1]) as f32);
            positions.push((p.z - offset[2]) as f32);

            // 颜色处理
            if let Some(color) = p.color {
                colors.push((color.red >> 8) as u8);
                colors.push((color.green >> 8) as u8);
                colors.push((color.blue >> 8) as u8);
            } else {
                // 默认绿色
                colors.push(0);
                colors.push(255);
                colors.push(0);
            }
        }
    }

    Ok(PointCloudData {
        positions,
        colors,
        offset,
    })
}
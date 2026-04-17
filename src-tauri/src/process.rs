use std::{ path::PathBuf };
use tauri_plugin_dialog::DialogExt;
use las::{Reader};
use serde::Serialize;
use tauri::{AppHandle, Emitter};
use crate::{data::{AppData, point_cloud::PointCloudData}, logger::push_log};
use std::path::Path;
use tauri::State;
use tauri::ipc::Response;
use bytemuck::cast_slice;


#[tauri::command]
pub fn check_file_exists(path: String) -> bool {
    // 使用 Path 结构体检查路径是否存在，且必须是一个文件
    let path_buf = Path::new(&path);
    path_buf.exists() && path_buf.is_file()
}

// 打开开发者工具（调试用）
#[tauri::command]
pub fn open_devtools(window: tauri::WebviewWindow) {
    window.open_devtools();
    push_log("debug", "open devtools".to_string());
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

    // 确保 y 对应 .y，z 对应 .z
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

// 加载las数据点
#[tauri::command]
pub async fn load_las_file(window: tauri::Window, _app: AppHandle, app_data: State<'_, AppData>, path: String) -> Result<Response, String> {

    // println!("rust加载测试......");

    let mut reader = Reader::from_path(&path).map_err(|e| e.to_string())?;
    let header = reader.header();
    let num_points = header.number_of_points() as usize;

    //最多渲染50w点
    let max_points = 500_000; 
    let step = if num_points > max_points { num_points / max_points } else { 1 };

    let bounds = header.bounds();
    let z_min = bounds.min.z;
    let z_max = bounds.max.z;
    let z_range = z_max - z_min;

    let offset = [
        (bounds.min.x + bounds.max.x) / 2.0,
        (bounds.min.y + bounds.max.y) / 2.0,
        (bounds.min.z + bounds.max.z) / 2.0,
    ];

    let estimated_points = num_points / step;
    // 原始数据向量（所有点）
    let mut original_positions = Vec::with_capacity(num_points * 3);
    let mut original_colors = Vec::with_capacity(num_points * 3);
    // 抽稀数据向量
    let mut downsampled_positions = Vec::with_capacity(estimated_points * 3);
    let mut downsampled_colors = Vec::with_capacity(estimated_points * 3);

    for (index, point) in reader.points().enumerate() {
        let p = point.map_err(|e| e.to_string())?;

        // 坐标处理
        let x = (p.x - offset[0]) as f32;
        let y = (p.y - offset[1]) as f32;
        let z = (p.z - offset[2]) as f32;

        // 根据 Z 值计算颜色
        // 计算当前点在高度范围内的比例 (0.0 ~ 1.0)
        let ratio = if z_range > 0.0 {
            (p.z - z_min) / z_range
        } else {
            0.5
        };

        // 彩虹色映射函数
        let (r, g, b) = get_color_from_ratio(ratio);

        // 添加到原始数据
        original_positions.push(x);
        original_positions.push(y);
        original_positions.push(z);
        original_colors.push(r);
        original_colors.push(g);
        original_colors.push(b);

        // 如果满足抽稀条件，添加到抽稀数据
        if index % step == 0 {
            downsampled_positions.push(x);
            downsampled_positions.push(y);
            downsampled_positions.push(z);
            downsampled_colors.push(r);
            downsampled_colors.push(g);
            downsampled_colors.push(b);
        }
    }

    let point_count = (downsampled_positions.len() / 3) as u64;

    //开始构建二进制包
    let mut binary_payload = Vec::new();

    // 写 header
    binary_payload.extend_from_slice(&point_count.to_le_bytes());

    // 写 offset
    binary_payload.extend_from_slice(cast_slice(&offset));

    // 写 positions
    binary_payload.extend_from_slice(cast_slice(&downsampled_positions));

    // 写 colors
    binary_payload.extend_from_slice(&downsampled_colors);

    let original_result = PointCloudData {
        positions: original_positions,
        colors: original_colors,
        offset,
    };
    let downsampled_result = PointCloudData {
        positions: downsampled_positions,
        colors: downsampled_colors,
        offset,
    };

    // 写入 source_data (原始数据)
    {
        let mut data = app_data.source_data.write().unwrap();
        *data = Some(original_result);
    }

    // 写入 vo_source_data (抽稀数据)
    {
        let mut data = app_data.vo_source_data.write().unwrap();
        *data = Some(downsampled_result);
    }

    // 写入当前文件 ID（可以用 path 或文件名）
    {
        let mut file_id = app_data.current_file_id.write().unwrap();
        *file_id = path.clone();
    }

    window.emit("log-event", format!("文件加载成功：{}", path)).unwrap();

    // let voxel: PointCloudData = voxel_downsample_las(&window, &cur, 0.5);

    // let cleaned: PointCloudData = sor_filter_pro(&window, &voxel, 30, 2.0);

    Ok(
        Response::new(binary_payload)
    )
}


fn get_color_from_ratio(ratio: f64) -> (u8, u8, u8) {
    let r = (255.0 * ratio).clamp(0.0, 255.0) as u8;
    let g = (255.0 * (1.0 - (ratio - 0.5).abs() * 2.0)).clamp(0.0, 255.0) as u8;
    let b = (255.0 * (1.0 - ratio)).clamp(0.0, 255.0) as u8;
    
    (r, g, b)
}
use std::{ path::PathBuf };
use tauri_plugin_dialog::DialogExt;
use las::{Reader};
use serde::Serialize;
use tauri::{AppHandle, Manager};
use crate::logger::{push_log};
use std::path::Path;
use rayon::prelude::*;
use kiddo::{KdTree, SquaredEuclidean};
use rand::seq::SliceRandom;
use std::sync::atomic::{AtomicUsize, Ordering};
use tauri::Emitter;

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

// 加载las数据点
#[tauri::command]
pub async fn load_las_file(_app: AppHandle, window: tauri::Window, path: String) -> Result<PointCloudData, String> {

    println!("rust加载测试......");

    let mut reader = Reader::from_path(path).map_err(|e| e.to_string())?;
    let header = reader.header();
    let num_points = header.number_of_points() as usize;

    // let max_points = 2_000_000; 
    // let step = if num_points > max_points { num_points / max_points } else { 1 };

    let step = 1;

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
    let mut positions = Vec::with_capacity(estimated_points * 3);
    let mut colors = Vec::with_capacity(estimated_points * 3);

    for (index, point) in reader.points().enumerate() {
        if index % step == 0 {
            let p = point.map_err(|e| e.to_string())?;
            
            // 坐标处理
            positions.push((p.x - offset[0]) as f32);
            positions.push((p.y - offset[1]) as f32);
            positions.push((p.z - offset[2]) as f32);

            // 根据 Z 值计算颜色
            // 计算当前点在高度范围内的比例 (0.0 ~ 1.0)
            let ratio = if z_range > 0.0 {
                (p.z - z_min) / z_range
            } else {
                0.5
            };

            // 彩虹色映射函数
            let (r, g, b) = get_color_from_ratio(ratio);
            colors.push(r);
            colors.push(g);
            colors.push(b);
        }
    }

    let cur = PointCloudData{positions,colors,offset };

    let voxel: PointCloudData = voxel_downsample_las(&window, &cur, 0.5);

    // println!("voxel success");

    let cleaned: PointCloudData = sor_filter_pro(&window, &voxel, 30, 2.0);

    // println!("cleaned success");

    window.emit("log-event", format!("去除点数：{}", voxel.positions.len() / 3 - cleaned.positions.len() / 3)).unwrap();
    window.emit("log-event", "*************数据处理完成************").unwrap();

    println!("{}", format!("voxel点数：{}", voxel.positions.len() / 3));
    println!("{}", format!("cleaned点数：{}", cleaned.positions.len() / 3));

    Ok(
        cleaned
    )
}


fn get_color_from_ratio(ratio: f64) -> (u8, u8, u8) {
    let r = (255.0 * ratio).clamp(0.0, 255.0) as u8;
    let g = (255.0 * (1.0 - (ratio - 0.5).abs() * 2.0)).clamp(0.0, 255.0) as u8;
    let b = (255.0 * (1.0 - ratio)).clamp(0.0, 255.0) as u8;
    
    (r, g, b)
}


pub fn voxel_downsample_las(
    window: &tauri::Window, // 新增 window 参数用于进度显示
    data: &PointCloudData, 
    voxel_size: f32
) -> PointCloudData {
    let num_points = data.positions.len() / 3;
    if num_points == 0 {
        return PointCloudData {
            positions: Vec::new(),
            colors: Vec::new(),
            offset: data.offset,
        };
    }

    let _ = window.emit("log-event", "[1/3] 正在对原始点进行体素标记...");
    // println!("[1/3] 正在对原始点进行体素标记...");

    let inv_voxel_size = 1.0 / voxel_size;
    let processed_1 = AtomicUsize::new(0);
    let step_1 = (num_points / 100).max(1);

    // 1. 生成 (VoxelKey, Index) 数组
    let mut keyed_indices: Vec<((i64, i64, i64), usize)> = (0..num_points)
        .into_par_iter()
        .map(|i| {
            let base = i * 3;
            let x = data.positions[base] as f64 + data.offset[0];
            let y = data.positions[base + 1] as f64 + data.offset[1];
            let z = data.positions[base + 2] as f64 + data.offset[2];

            let key = (
                (x * inv_voxel_size as f64).floor() as i64,
                (y * inv_voxel_size as f64).floor() as i64,
                (z * inv_voxel_size as f64).floor() as i64,
            );

            // 更新进度
            let curr = processed_1.fetch_add(1, Ordering::Relaxed) + 1;
            if curr % (step_1 * 5) == 0 || curr == num_points {
                let p = (curr as f32 / num_points as f32 * 100.0) as u32;
                // 如果需要同步给前端
                let _ = window.emit("log-event", format!(">> 标记进度: {}%", p));
            }

            (key, i)
        })
        .collect();

    // println!("\n[2/3] 正在对体素进行空间重排...");
    let _ = window.emit("log-event", "[2/3] 正在对体素进行空间重排...");
    
    // 并行不稳定排序
    keyed_indices.par_sort_unstable_by_key(|&(key, _)| key);

    // 寻找边界
    let boundaries: Vec<usize> = (0..keyed_indices.len())
        .into_par_iter()
        .filter(|&i| i == 0 || keyed_indices[i].0 != keyed_indices[i - 1].0)
        .chain(rayon::iter::once(keyed_indices.len()))
        .collect();

    let num_voxels = boundaries.len().saturating_sub(1);
    // println!("[3/3] 正在计算体素质心 (体素数量: {})...", num_voxels);
    let _ = window.emit("log-event", format!("[3/3] 正在计算体素质心 (体素数量: {})...", num_voxels));

    let processed_2 = AtomicUsize::new(0);
    let step_2 = (num_voxels / 100).max(1);

    // 并行计算质心
    let results: Vec<(f32, f32, f32, u8, u8, u8)> = boundaries
        .par_windows(2)
        .map(|window_slice| {
            let start = window_slice[0];
            let end = window_slice[1];
            let count = (end - start) as f32;

            let mut sum_x = 0.0;
            let mut sum_y = 0.0;
            let mut sum_z = 0.0;
            let mut sum_r = 0u64;
            let mut sum_g = 0u64;
            let mut sum_b = 0u64;

            for j in start..end {
                let idx = keyed_indices[j].1;
                let p_base = idx * 3;
                sum_x += data.positions[p_base];
                sum_y += data.positions[p_base + 1];
                sum_z += data.positions[p_base + 2];

                if !data.colors.is_empty() {
                    sum_r += data.colors[p_base] as u64;
                    sum_g += data.colors[p_base + 1] as u64;
                    sum_b += data.colors[p_base + 2] as u64;
                }
            }

            // 更新进度
            let curr = processed_2.fetch_add(1, Ordering::Relaxed) + 1;
            if curr % step_2 == 0 || curr == num_voxels {
                let p = (curr as f32 / num_voxels as f32 * 100.0) as u32;
                // print!("\r>> 计算进度: {}%", p);
                // io::stdout().flush().unwrap();
                let _ = window.emit("log-event", format!(">> 计算进度: {}%", p));
            }

            (
                sum_x / count,
                sum_y / count,
                sum_z / count,
                (sum_r / (end - start) as u64) as u8,
                (sum_g / (end - start) as u64) as u8,
                (sum_b / (end - start) as u64) as u8,
            )
        })
        .collect();

    println!("\n体素采样完成，正在同步结果...");

    // 重新组装
    let mut out_positions = Vec::with_capacity(results.len() * 3);
    let mut out_colors = Vec::with_capacity(results.len() * 3);

    for (x, y, z, r, g, b) in results {
        out_positions.extend_from_slice(&[x, y, z]);
        if !data.colors.is_empty() {
            out_colors.extend_from_slice(&[r, g, b]);
        }
    }

    PointCloudData {
        positions: out_positions,
        colors: out_colors,
        offset: data.offset,
    }
}



pub fn sor_filter_pro(
    window: &tauri::Window,
    data: &PointCloudData,
    k: usize,
    std_ratio: f32,
) -> PointCloudData {
    let num_points = data.positions.len() / 3;

    if num_points <= k {
        return data.clone();
    }

    // 1. 构建 KdTree
    window.emit("log-event", "[1/3] 正在构建空间索引...").unwrap();
    let mut tree: KdTree<f32, 3> = KdTree::with_capacity(num_points);
    for i in 0..num_points {
        let base = i * 3;
        tree.add(
            &[data.positions[base], data.positions[base + 1], data.positions[base + 2]],
            i as u64,
        );
    }

    // 2. 统计量估算
    // println!("[2/3] 正在分析数据分布...");
    window.emit("log-event", "[2/3] 正在分析数据分布...").unwrap();
    let sample_count = 1_000_000.min(num_points);
    let mut rng = rand::rng();
    let mut indices: Vec<usize> = (0..num_points).collect();
    indices.shuffle(&mut rng);

    let sample_avg_dists: Vec<f32> = indices[..sample_count]
        .par_iter()
        .map(|&i| {
            let base = i * 3;
            let query = [data.positions[base], data.positions[base + 1], data.positions[base + 2]];
            let neighbors = tree.nearest_n::<SquaredEuclidean>(&query, k + 1);
            
            let mut sum_dist = 0.0;
            let mut count = 0;
            for n in neighbors {
                if n.item as usize != i {
                    sum_dist += n.distance.sqrt();
                    count += 1;
                }
            }
            if count > 0 { sum_dist / count as f32 } else { 0.0 }
        })
        .collect();

    let sample_sum: f32 = sample_avg_dists.iter().sum();
    let mean = sample_sum / sample_count as f32;
    let variance: f32 = sample_avg_dists.iter().map(|&d| (d - mean).powi(2)).sum::<f32>() / sample_count as f32;
    let std_dev = variance.sqrt();
    let threshold = mean + std_ratio * std_dev;

    // 3. 全量并行判定 + 进度显示
    // println!("[3/3] 正在执行全量去噪计算...");
    window.emit("log-event", "[3/3] 正在执行全量去噪计算...").unwrap();
    let processed_count = AtomicUsize::new(0);
    let progress_step = (num_points / 100).max(1); // 每 1% 刷新一次

    let keep_mask: Vec<bool> = (0..num_points)
        .into_par_iter()
        .map(|i| {
            let base = i * 3;
            let query = [data.positions[base], data.positions[base + 1], data.positions[base + 2]];
            let neighbors = tree.nearest_n::<SquaredEuclidean>(&query, k + 1);
            
            let mut sum_dist = 0.0;
            let mut count = 0;
            for n in neighbors {
                if n.item as usize != i {
                    sum_dist += n.distance.sqrt();
                    count += 1;
                }
            }

            // --- 进度条刷新逻辑 ---
            let current = processed_count.fetch_add(1, Ordering::Relaxed) + 1;
            if current % progress_step == 0 || current == num_points {
                let percentage = (current as f32 / num_points as f32 * 100.0) as u32;
                let msg = format!(">> 当前进度: {}%", percentage);
                window.emit("log-event", msg).unwrap();
            }

            let d = if count > 0 { sum_dist / count as f32 } else { 0.0 };
            d <= threshold
        })
        .collect();

    // println!("\n计算完成，正在导出数据...");
    window.emit("log-event", "数据去噪完成...").unwrap();

    // 4. 同步抽取数据
    let mut new_positions = Vec::with_capacity(num_points * 3);
    let mut new_colors = Vec::with_capacity(data.colors.len());

    for i in 0..num_points {
        if keep_mask[i] {
            let base = i * 3;
            new_positions.extend_from_slice(&data.positions[base..base + 3]);
            if !data.colors.is_empty() {
                new_colors.extend_from_slice(&data.colors[base..base + 3]);
            }
        }
    }

    PointCloudData {
        positions: new_positions,
        colors: new_colors,
        offset: data.offset,
    }
}
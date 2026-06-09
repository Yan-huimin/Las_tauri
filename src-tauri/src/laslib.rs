use rayon::prelude::*;
use kiddo::{float::kdtree::KdTree, SquaredEuclidean};
use std::sync::atomic::{AtomicUsize, Ordering};
use tauri::{Emitter, State};
use tauri::ipc::Response;
use tauri_plugin_dialog::DialogExt;
use bytemuck::cast_slice;
use crate::data::{AppData, point_cloud::PointCloudData};
use crate::logger::push_log;

const BUCKET_SIZE: usize = 64;

// ============================================================
//  内部辅助: 体素降采样纯计算 (不涉及 app_data)
//  用于 spawn_blocking
// ============================================================
fn voxel_downsample_compute(
    window: tauri::Window,
    data: PointCloudData,
    voxel_size: f32,
) -> Result<(Vec<f32>, Vec<u8>, [f64; 3], Vec<u8>), String> {
    let num_points = data.positions.len() / 3;
    if num_points == 0 {
        let point_count: u64 = 0;
        let mut binary_payload = Vec::new();
        binary_payload.extend_from_slice(&point_count.to_le_bytes());
        binary_payload.extend_from_slice(cast_slice(&data.offset));
        return Ok((Vec::new(), Vec::new(), data.offset, binary_payload));
    }

    let _ = window.emit("log-event", "[1/3] 正在对原始点进行体素标记...");

    let inv_voxel_size = 1.0 / voxel_size;
    let processed_1 = AtomicUsize::new(0);
    let step_1 = (num_points / 100).max(1);

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

            let curr = processed_1.fetch_add(1, Ordering::Relaxed) + 1;
            if curr % (step_1 * 5) == 0 || curr == num_points {
                let p = (curr as f32 / num_points as f32 * 100.0) as u32;
                let _ = window.emit("log-event", format!(">> 标记进度: {}%", p));
            }

            (key, i)
        })
        .collect();

    let _ = window.emit("log-event", "[2/3] 正在对体素进行空间重排...");

    keyed_indices.par_sort_unstable_by_key(|&(key, _)| key);

    let boundaries: Vec<usize> = (0..keyed_indices.len())
        .into_par_iter()
        .filter(|&i| i == 0 || keyed_indices[i].0 != keyed_indices[i - 1].0)
        .chain(rayon::iter::once(keyed_indices.len()))
        .collect();

    let num_voxels = boundaries.len().saturating_sub(1);
    let _ = window.emit("log-event", format!("[3/3] 正在计算体素质心 (体素数量: {})...", num_voxels));

    let processed_2 = AtomicUsize::new(0);
    let step_2 = (num_voxels / 100).max(1);

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

            let curr = processed_2.fetch_add(1, Ordering::Relaxed) + 1;
            if curr % step_2 == 0 || curr == num_voxels {
                let p = (curr as f32 / num_voxels as f32 * 100.0) as u32;
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

    let mut out_positions = Vec::with_capacity(results.len() * 3);
    let mut out_colors = Vec::with_capacity(results.len() * 3);

    for (x, y, z, r, g, b) in results {
        out_positions.extend_from_slice(&[x, y, z]);
        if !data.colors.is_empty() {
            out_colors.extend_from_slice(&[r, g, b]);
        }
    }

    out_positions.shrink_to_fit();
    out_colors.shrink_to_fit();

    let point_count = (out_positions.len() / 3) as u64;

    let mut binary_payload = Vec::new();
    binary_payload.extend_from_slice(&point_count.to_le_bytes());
    binary_payload.extend_from_slice(cast_slice(&data.offset));
    binary_payload.extend_from_slice(cast_slice(&out_positions));
    binary_payload.extend_from_slice(&out_colors);

    Ok((out_positions, out_colors, data.offset, binary_payload))
}

#[tauri::command]
pub async fn voxel_downsample_las(
    window: tauri::Window,
    app_data: State<'_, AppData>,
    voxel_size: f32,
) -> Result<Response, String> {

    let data = {
        let guard = app_data.source_data.read().unwrap();
        guard.as_ref().cloned().ok_or("没有可用的源数据, 请先加载LAS文件")?
    };

    // 清空旧数据
    {
        let mut old_data = app_data.vo_source_data.write().unwrap();
        *old_data = None;
    }

    // CPU 密集计算 — spawn_blocking 避免阻塞异步运行时
    let (out_positions, out_colors, offset, binary_payload) =
        tauri::async_runtime::spawn_blocking(move || {
            voxel_downsample_compute(window, data, voxel_size)
        }).await.map_err(|e| e.to_string())??;

    // 存储到 vo_source_data（在异步线程完成，不在 spawn_blocking 内）
    let res = PointCloudData {
        positions: out_positions,
        colors: out_colors,
        offset,
    };
    {
        let mut data = app_data.vo_source_data.write().unwrap();
        *data = Some(res);
    }
    {
        let mut done = app_data.processing_done.write().unwrap();
        *done = true;
    }

    Ok(Response::new(binary_payload))
}


// ============================================================
//  SOR 内部计算 (不涉及 app_data, 用于 spawn_blocking)
// ============================================================
fn sor_filter_compute(
    window: tauri::Window,
    data: PointCloudData,
    k_neighbors: usize,
    std_mul: f32,
) -> Result<PointCloudData, String> {
    let num_points = data.positions.len() / 3;

    if num_points <= k_neighbors || k_neighbors == 0 {
        return Ok(data);
    }

    window.emit("log-event", "[1/4] 构建KDTree...")
        .map_err(|e| e.to_string())?;

    let mut tree: KdTree<f32, u64, 3, BUCKET_SIZE, u32> =
        KdTree::with_capacity(num_points);

    for i in 0..num_points {
        let base = i * 3;
        tree.add(
            &[
                data.positions[base],
                data.positions[base + 1],
                data.positions[base + 2],
            ],
            i as u64,
        );
    }

    window.emit("log-event", "[2/4] 计算邻域距离...")
        .map_err(|e| e.to_string())?;

    let mut distances = vec![0.0f64; num_points];

    distances.par_iter_mut().enumerate().for_each(|(i, dist_val)| {
        let base = i * 3;

        let query = [
            data.positions[base],
            data.positions[base + 1],
            data.positions[base + 2],
        ];

        let neighbors =
            tree.nearest_n::<SquaredEuclidean>(&query, k_neighbors + 1);

        let mut dist_sum = 0.0f64;
        let mut count = 0;

        for n in neighbors {
            let idx = n.item as usize;
            if idx != i {
                dist_sum += (n.distance as f64).sqrt();
                count += 1;
            }
        }

        if count > 0 {
            *dist_val = dist_sum / count as f64;
        } else {
            *dist_val = 0.0;
        }
    });

    window.emit("log-event", "[3/4] 统计分布...")
        .map_err(|e| e.to_string())?;

    let mut sum = 0.0f64;
    let mut sq_sum = 0.0f64;

    for &d in &distances {
        sum += d;
        sq_sum += d * d;
    }

    let n = num_points as f64;
    let mean = sum / n;

    let variance = if n > 1.0 {
        (sq_sum - (sum * sum) / n) / (n - 1.0)
    } else {
        0.0
    };

    let stddev = variance.sqrt();
    let threshold = mean + std_mul as f64 * stddev;

    window.emit("log-event", "[4/4] 执行滤波...")
        .map_err(|e| e.to_string())?;

    let mut new_positions = Vec::with_capacity(num_points * 3);
    let mut new_colors = Vec::with_capacity(data.colors.len());

    for i in 0..num_points {
        if distances[i] <= threshold {
            let base = i * 3;
            new_positions.extend_from_slice(&data.positions[base..base + 3]);
            if data.colors.len() >= base + 3 {
                new_colors.extend_from_slice(&data.colors[base..base + 3]);
            }
        }
    }

    window.emit(
        "log-event",
        format!(
            "SOR完成: {} -> {} (mean={:.5}, stddev={:.5})",
            num_points,
            new_positions.len() / 3,
            mean,
            stddev
        ),
    ).ok();

    Ok(PointCloudData {
        positions: new_positions,
        colors: new_colors,
        offset: data.offset,
    })
}

#[tauri::command]
pub async fn sor_filter_pro(
    window: tauri::Window,
    data: PointCloudData,
    k_neighbors: usize,
    std_mul: f32,
) -> Result<PointCloudData, String> {
    let num_points = data.positions.len() / 3;
    if num_points <= k_neighbors || k_neighbors == 0 {
        return Ok(data);
    }

    tauri::async_runtime::spawn_blocking(move || {
        sor_filter_compute(window, data, k_neighbors, std_mul)
    }).await.map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn denoise_las(
    window: tauri::Window,
    app_data: tauri::State<'_, crate::data::AppData>,
    k_neighbors: usize,
    std_mul: f32,
) -> Result<Response, String> {
    let data = {
        let guard = app_data.vo_source_data.read().unwrap();
        guard.as_ref().cloned().ok_or("没有可用的点云数据, 请先加载文件")?
    };

    let result = sor_filter_pro(window, data, k_neighbors, std_mul).await?;

    // 构建二进制包
    let point_count = (result.positions.len() / 3) as u64;
    let mut binary_payload = Vec::new();
    binary_payload.extend_from_slice(&point_count.to_le_bytes());
    binary_payload.extend_from_slice(cast_slice(&result.offset));
    binary_payload.extend_from_slice(cast_slice(&result.positions));
    binary_payload.extend_from_slice(&result.colors);

    {
        let mut stored = app_data.vo_source_data.write().unwrap();
        *stored = Some(result);
    }
    {
        let mut done = app_data.processing_done.write().unwrap();
        *done = true;
    }

    Ok(Response::new(binary_payload))
}

#[tauri::command]
pub async fn save_las_file(
    app_handle: tauri::AppHandle,
    app_data: tauri::State<'_, AppData>,
) -> Result<String, String> {
    let processing_done = *app_data.processing_done.read().unwrap();
    if !processing_done {
        return Err("请先进行降采样或去噪处理".to_string());
    }

    let data = {
        let guard = app_data.vo_source_data.read().unwrap();
        guard.as_ref().cloned().ok_or("没有可用的处理后数据".to_string())?
    };

    let num_points = data.positions.len() / 3;
    if num_points == 0 {
        return Err("没有可保存的点云数据".to_string());
    }

    let save_path = app_handle
        .dialog()
        .file()
        .add_filter("LAS 文件", &["las"])
        .set_title("保存处理后的点云文件")
        .blocking_save_file()
        .ok_or("用户取消了保存")?
        .into_path()
        .map_err(|e| format!("路径无效: {}", e))?;

    let mut builder = las::Builder::from((1, 2));
    builder.point_format = las::point::Format::new(2).map_err(|e| e.to_string())?;
    builder.system_identifier = "Las Tauri".to_string();
    builder.generating_software = "Las Tauri Processor".to_string();
    let header = builder.into_header().map_err(|e| e.to_string())?;

    let file = std::fs::File::create(&save_path).map_err(|e| e.to_string())?;
    let mut writer =
        las::Writer::new(std::io::BufWriter::new(file), header).map_err(|e| e.to_string())?;

    for i in 0..num_points {
        let base = i * 3;
        let point = las::Point {
            x: data.positions[base] as f64 + data.offset[0],
            y: data.positions[base + 1] as f64 + data.offset[1],
            z: data.positions[base + 2] as f64 + data.offset[2],
            color: if !data.colors.is_empty() {
                Some(las::Color::new(
                    (data.colors[base] as u16) * 257,
                    (data.colors[base + 1] as u16) * 257,
                    (data.colors[base + 2] as u16) * 257,
                ))
            } else {
                None
            },
            return_number: 1,
            number_of_returns: 1,
            ..Default::default()
        };
        writer.write_point(point).map_err(|e| e.to_string())?;
    }

    writer.close().map_err(|e| e.to_string())?;

    let path_str = save_path.to_string_lossy().to_string();
    push_log(
        "info",
        format!("处理后的点云已保存: {} ({} 个点)", path_str, num_points),
    );

    Ok(path_str)
}

use rayon::prelude::*;
use kiddo::{float::kdtree::KdTree, SquaredEuclidean};
use std::sync::atomic::{AtomicUsize, Ordering};
use tauri::{Emitter, State};
use tauri_plugin_dialog::DialogExt;
use crate::data::{AppData, point_cloud::PointCloudData};
use crate::logger::push_log;

const BUCKET_SIZE: usize = 64;

#[tauri::command]
pub async fn voxel_downsample_las(
    window: tauri::Window, // window 参数用于进度显示
    app_data: State<'_, AppData>,
    voxel_size: f32
) -> Result<PointCloudData, String> {

    let data = {
        let guard = app_data.source_data.read().unwrap();
        guard.as_ref().cloned().ok_or("没有可用的源数据, 请先加载LAS文件")?
    };

    // 清空旧数据，释放内存
    {
        let mut old_data = app_data.vo_source_data.write().unwrap();
        *old_data = None;
    }

    let num_points = data.positions.len() / 3;
    if num_points == 0 {
        return Ok(PointCloudData {
            positions: Vec::new(),
            colors: Vec::new(),
            offset: data.offset,
        })
    }

    let _ = window.emit("log-event", "[1/3] 正在对原始点进行体素标记...");
    // println!("[1/3] 正在对原始点进行体素标记...");

    let inv_voxel_size = 1.0 / voxel_size;
    let processed_1 = AtomicUsize::new(0);
    let step_1 = (num_points / 100).max(1);

    // 生成 (VoxelKey, Index) 数组
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

    // 优化内存使用
    out_positions.shrink_to_fit();
    out_colors.shrink_to_fit();

    let res = PointCloudData {
        positions: out_positions,
        colors: out_colors,
        offset: data.offset,
     };

    // 克隆一份给前端，原始数据存储到 vo_source_data
    let result_for_frontend = res.clone();
    {
        let mut data = app_data.vo_source_data.write().unwrap();
        *data = Some(res);  // 移动所有权到存储
    }
    {
        let mut done = app_data.processing_done.write().unwrap();
        *done = true;
    }

    Ok(result_for_frontend)
}


// #[tauri::command]
// pub async fn sor_filter_pro(
//     window: tauri::Window,
//     data: PointCloudData,
//     k: usize,
//     std_ratio: f32,
// ) -> Result<PointCloudData, String> {
//     let num_points = data.positions.len() / 3;

//     if num_points <= k {
//         return Ok(data.clone());
//     }

//     // 1. 构建 KdTree
//     window.emit("log-event", "[1/3] 正在构建空间索引...").unwrap();
//     let mut tree: KdTree<f32, u64, 3, BUCKET_SIZE, u32> = KdTree::with_capacity(num_points);
//     for i in 0..num_points {
//         let base = i * 3;
//         tree.add(
//             &[data.positions[base], data.positions[base + 1], data.positions[base + 2]],
//             i as u64,
//         );
//     }

//     // 2. 统计量估算
//     // println!("[2/3] 正在分析数据分布...");
//     window.emit("log-event", "[2/3] 正在分析数据分布...").unwrap();
//     let sample_count = 1_000_000.min(num_points);
//     let mut rng = rand::rng();
//     let mut indices: Vec<usize> = (0..num_points).collect();
//     indices.shuffle(&mut rng);

//     let sample_avg_dists: Vec<f32> = indices[..sample_count]
//         .par_iter()
//         .map(|&i| {
//             let base = i * 3;
//             let query = [data.positions[base], data.positions[base + 1], data.positions[base + 2]];
//             let neighbors = tree.nearest_n::<SquaredEuclidean>(&query, k + 1);
            
//             let mut sum_dist = 0.0;
//             let mut count = 0;
//             for n in neighbors {
//                 if n.item as usize != i {
//                     sum_dist += n.distance.sqrt();
//                     count += 1;
//                 }
//             }
//             if count > 0 { sum_dist / count as f32 } else { 0.0 }
//         })
//         .collect();

//     let sample_sum: f32 = sample_avg_dists.iter().sum();
//     let mean = sample_sum / sample_count as f32;
//     let variance: f32 = sample_avg_dists.iter().map(|&d| (d - mean).powi(2)).sum::<f32>() / sample_count as f32;
//     let std_dev = variance.sqrt();
//     let threshold = mean + std_ratio * std_dev;

//     // 3. 全量并行判定 + 进度显示
//     // println!("[3/3] 正在执行全量去噪计算...");
//     window.emit("log-event", "[3/3] 正在执行全量去噪计算...").unwrap();
//     let processed_count = AtomicUsize::new(0);
//     let progress_step = (num_points / 100).max(1); // 每 1% 刷新一次

//     let keep_mask: Vec<bool> = (0..num_points)
//         .into_par_iter()
//         .map(|i| {
//             let base = i * 3;
//             let query = [data.positions[base], data.positions[base + 1], data.positions[base + 2]];
//             let neighbors = tree.nearest_n::<SquaredEuclidean>(&query, k + 1);
            
//             let mut sum_dist = 0.0;
//             let mut count = 0;
//             for n in neighbors {
//                 if n.item as usize != i {
//                     sum_dist += n.distance.sqrt();
//                     count += 1;
//                 }
//             }

//             // --- 进度条刷新逻辑 ---
//             let current = processed_count.fetch_add(1, Ordering::Relaxed) + 1;
//             if current % progress_step == 0 || current == num_points {
//                 let percentage = (current as f32 / num_points as f32 * 100.0) as u32;
//                 let msg = format!(">> 当前进度: {}%", percentage);
//                 window.emit("log-event", msg).unwrap();
//             }

//             let d = if count > 0 { sum_dist / count as f32 } else { 0.0 };
//             d <= threshold
//         })
//         .collect();

//     // println!("\n计算完成，正在导出数据...");
//     window.emit("log-event", "数据去噪完成...").unwrap();

//     // 4. 同步抽取数据
//     let mut new_positions = Vec::with_capacity(num_points * 3);
//     let mut new_colors = Vec::with_capacity(data.colors.len());

//     for i in 0..num_points {
//         if keep_mask[i] {
//             let base = i * 3;
//             new_positions.extend_from_slice(&data.positions[base..base + 3]);
//             if !data.colors.is_empty() {
//                 new_colors.extend_from_slice(&data.colors[base..base + 3]);
//             }
//         }
//     }

//     Ok(PointCloudData {
//         positions: new_positions,
//         colors: new_colors,
//         offset: data.offset,
//     })
// }


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

    // ===============================
    // KDTree 构建（对应 tree_->setInputCloud）
    // ===============================
    window.emit("log-event", "[1/3] 构建KDTree...")
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

    // ===============================
    // 计算 mean distance（核心）
    // mean distance of k neighbors
    // ===============================
    window.emit("log-event", "[2/3] 计算邻域距离...")
        .map_err(|e| e.to_string())?;

    let mut distances = vec![0.0f64; num_points];

    distances.par_iter_mut().enumerate().for_each(|(i, dist_val)| {
        let base = i * 3;

        let query = [
            data.positions[base],
            data.positions[base + 1],
            data.positions[base + 2],
        ];

        // PCL: k neighbors + self → k+1
        let neighbors =
            tree.nearest_n::<SquaredEuclidean>(&query, k_neighbors + 1);

        let mut dist_sum = 0.0f64;
        let mut count = 0;

        for n in neighbors {
            let idx = n.item as usize;

            // ✅ 只排除自身（PCL行为）
            if idx != i {
                dist_sum += (n.distance as f64).sqrt();
                count += 1;
            }
        }

        // PCL：如果找到邻居就取平均，否则=0
        if count > 0 {
            *dist_val = dist_sum / count as f64;
        } else {
            *dist_val = 0.0;
        }
    });

    // ===============================
    // 全局统计
    // ===============================
    window.emit("log-event", "[3/3] 统计分布...")
        .map_err(|e| e.to_string())?;

    let mut sum = 0.0f64;
    let mut sq_sum = 0.0f64;

    // ⚠️ PCL：所有点都参与（包括0）
    for &d in &distances {
        sum += d;
        sq_sum += d * d;
    }

    let n = num_points as f64;

    let mean = sum / n;

    // 无偏方差（n-1）
    let variance = if n > 1.0 {
        (sq_sum - (sum * sum) / n) / (n - 1.0)
    } else {
        0.0
    };

    let stddev = variance.sqrt();

    let threshold = mean + std_mul as f64 * stddev;

    // ===============================
    // 4. 过滤（applyFilter）
    // ===============================
    window.emit("log-event", "[4/4] 执行滤波...")
        .map_err(|e| e.to_string())?;

    let mut new_positions = Vec::with_capacity(num_points * 3);
    let mut new_colors = Vec::with_capacity(data.colors.len());

    for i in 0..num_points {
        // PCL: <= threshold 保留
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
pub async fn denoise_las(
    window: tauri::Window,
    app_data: tauri::State<'_, crate::data::AppData>,
    k_neighbors: usize,
    std_mul: f32,
) -> Result<crate::data::point_cloud::PointCloudData, String> {
    // 从 vo_source_data 获取当前数据
    let data = {
        let guard = app_data.vo_source_data.read().unwrap();
        guard.as_ref().cloned().ok_or("没有可用的点云数据, 请先加载文件")?
    };

    // 调用 sor_filter_pro
    let result = sor_filter_pro(window, data, k_neighbors, std_mul).await?;

    // 将去噪结果存回 vo_source_data
    {
        let mut stored = app_data.vo_source_data.write().unwrap();
        *stored = Some(result.clone());
    }
    {
        let mut done = app_data.processing_done.write().unwrap();
        *done = true;
    }

    Ok(result)
}

#[tauri::command]
pub async fn save_las_file(
    app_handle: tauri::AppHandle,
    app_data: tauri::State<'_, AppData>,
) -> Result<String, String> {
    // 检查是否进行了处理
    let processing_done = *app_data.processing_done.read().unwrap();
    if !processing_done {
        return Err("请先进行降采样或去噪处理".to_string());
    }

    // 获取处理后的数据
    let data = {
        let guard = app_data.vo_source_data.read().unwrap();
        guard.as_ref().cloned().ok_or("没有可用的处理后数据".to_string())?
    };

    let num_points = data.positions.len() / 3;
    if num_points == 0 {
        return Err("没有可保存的点云数据".to_string());
    }

    // 弹出保存对话框
    let save_path = app_handle
        .dialog()
        .file()
        .add_filter("LAS 文件", &["las"])
        .set_title("保存处理后的点云文件")
        .blocking_save_file()
        .ok_or("用户取消了保存")?
        .into_path()
        .map_err(|e| format!("路径无效: {}", e))?;

    // 使用 las Builder 创建 header (LAS 1.2, Format 2 = point + RGB color)
    let mut builder = las::Builder::from((1, 2));
    builder.point_format = las::point::Format::new(2).map_err(|e| e.to_string())?;
    builder.system_identifier = "Las Tauri".to_string();
    builder.generating_software = "Las Tauri Processor".to_string();
    let header = builder.into_header().map_err(|e| e.to_string())?;

    let file = std::fs::File::create(&save_path).map_err(|e| e.to_string())?;
    let mut writer =
        las::Writer::new(std::io::BufWriter::new(file), header).map_err(|e| e.to_string())?;

    // 写入所有点（恢复原始坐标，保存颜色）
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

    // 显式关闭以刷新 header
    writer.close().map_err(|e| e.to_string())?;

    let path_str = save_path.to_string_lossy().to_string();
    push_log(
        "info",
        format!("处理后的点云已保存: {} ({} 个点)", path_str, num_points),
    );

    Ok(path_str)
}
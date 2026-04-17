use rayon::prelude::*;
use kiddo::{KdTree, SquaredEuclidean};
use rand::seq::SliceRandom;
use std::sync::atomic::{AtomicUsize, Ordering};
use tauri::{Emitter, State};
use crate::data::{AppData, point_cloud::PointCloudData};




#[tauri::command]
pub async fn voxel_downsample_las(
    window: tauri::Window, // window 参数用于进度显示
    app_data: State<'_, AppData>,
    voxel_size: f32
) -> Result<PointCloudData, String> {

    let data = {
    let guard = app_data.source_data.read().unwrap();
        guard.clone().ok_or("没有可用的源数据, 请先加载LAS文件")?
    };

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

    let res = PointCloudData { 
        positions: out_positions,
        colors: out_colors,
        offset: data.offset,
     };

    // 写入 source_data
    {
        let mut data = app_data.vo_source_data.write().unwrap();
        *data = Some(res.clone());
    }

    Ok(
        res
    )
}



#[tauri::command]
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
pub(crate) mod point_cloud;

use std::sync::RwLock;
use crate::data::point_cloud::PointCloudData;

pub struct AppData {
    // 存储当前最活跃的源数据
    pub source_data: RwLock<Option<PointCloudData>>,
    // 存储降采样后的数据
    pub vo_source_data: RwLock<Option<PointCloudData>>,
    // 存储当前数据的文件名或 ID，方便前端确认
    pub current_file_id: RwLock<String>,
    // 标记是否已进行降采样或去噪处理
    pub processing_done: RwLock<bool>,
}

impl AppData {
    pub fn default() -> Self {
        Self {
            source_data: RwLock::new(None),
            vo_source_data: RwLock::new(None),
            current_file_id: RwLock::new("未导入".to_string()),
            processing_done: RwLock::new(false),
        }
    }
}
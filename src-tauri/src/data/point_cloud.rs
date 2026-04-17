use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PointCloudData {
    pub positions: Vec<f32>,
    pub colors: Vec<u8>,
    pub offset: [f64; 3],
}

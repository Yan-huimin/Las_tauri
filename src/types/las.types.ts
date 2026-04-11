export interface PointCloudData {
  positions: Float32Array; // 展平的 [x, y, z, x, y, z...]
  colors: Uint8Array;      // 展平的 [r, g, b, r, g, b...]
  offset: [number, number, number];
}

export interface LasInfo {
  x_max: number,  x_min: number,
  y_max: number,  y_min: number,
  z_max: number,  z_min: number,
  total_count: number,
}
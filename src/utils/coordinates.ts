/**
 * 坐标转换工具函数
 * 用于处理点云坐标与offset相关的转换
 */

/**
 * 从显示坐标（相对坐标）转换为原始坐标
 * @param displayCoords 显示坐标（已减去offset）
 * @param offset offset值
 * @returns 原始坐标（带offset）
 */
export function toOriginalCoords(
  displayCoords: [number, number, number],
  offset: [number, number, number]
): [number, number, number] {
  return [
    displayCoords[0] + offset[0],
    displayCoords[1] + offset[1],
    displayCoords[2] + offset[2]
  ];
}

/**
 * 从原始坐标转换为显示坐标
 * @param originalCoords 原始坐标（带offset）
 * @param offset offset值
 * @returns 显示坐标（已减去offset）
 */
export function toDisplayCoords(
  originalCoords: [number, number, number],
  offset: [number, number, number]
): [number, number, number] {
  return [
    originalCoords[0] - offset[0],
    originalCoords[1] - offset[1],
    originalCoords[2] - offset[2]
  ];
}

/**
 * 计算两点间的欧几里得距离（考虑XYZ三个维度）
 * @param point1 第一个点的坐标
 * @param point2 第二个点的坐标
 * @returns 两点间的距离
 */
export function calculateDistance(
  point1: [number, number, number],
  point2: [number, number, number]
): number {
  const dx = point2[0] - point1[0];
  const dy = point2[1] - point1[1];
  const dz = point2[2] - point1[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * 计算水平距离（仅考虑XY平面）
 * @param point1 第一个点的坐标
 * @param point2 第二个点的坐标
 * @returns 水平距离
 */
export function calculateHorizontalDistance(
  point1: [number, number, number],
  point2: [number, number, number]
): number {
  const dx = point2[0] - point1[0];
  const dy = point2[1] - point1[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算高程差（仅考虑Z轴）
 * @param point1 第一个点的坐标
 * @param point2 第二个点的坐标
 * @returns 高程差（绝对值）
 */
export function calculateHeightDifference(
  point1: [number, number, number],
  point2: [number, number, number]
): number {
  return Math.abs(point2[2] - point1[2]);
}

/**
 * 格式化距离显示
 * @param distance 距离值（单位：与输入坐标单位一致）
 * @param precision 小数点后位数
 * @returns 格式化后的字符串
 */
export function formatDistance(
  distance: number,
  precision: number = 3
): string {
  if (distance < 0.001) {
    return `${(distance * 1000).toFixed(precision)} mm`;
  } else if (distance < 1) {
    return `${(distance * 100).toFixed(precision)} cm`;
  } else if (distance < 1000) {
    return `${distance.toFixed(precision)} m`;
  } else {
    return `${(distance / 1000).toFixed(precision)} km`;
  }
}
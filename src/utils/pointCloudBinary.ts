import type { PointCloudData } from "@/types/las.types";

/**
 * 解析后端传来的点云二进制包
 * 结构：
 * 1. point_count (u64) - 8 字节
 * 2. offset (3 × f64) - 24 字节
 * 3. positions (N × 3 × f32) - N × 12 字节
 * 4. colors (N × 3 × u8) - N × 3 字节
 */
export function parsePointCloudBinary(input: Uint8Array | ArrayBuffer): PointCloudData {
    const buffer = input instanceof Uint8Array ? input.buffer : input;
    const byteOffset = input instanceof Uint8Array ? input.byteOffset : 0;
    const byteLength = input instanceof Uint8Array ? input.byteLength : input.byteLength;

    let cursor = 0;

    const view = new DataView(buffer, byteOffset, byteLength);

    const pointCount = Number(view.getBigUint64(cursor, true));
    cursor += 8;

    const offsetView = new Float64Array(buffer, byteOffset + cursor, 3);
    const offset: [number, number, number] = [offsetView[0], offsetView[1], offsetView[2]];
    cursor += 24;

    const positions = new Float32Array(buffer, byteOffset + cursor, pointCount * 3);
    cursor += pointCount * 3 * 4;

    const colors = new Uint8Array(buffer, byteOffset + cursor, pointCount * 3);

    return { positions, colors, offset };
}

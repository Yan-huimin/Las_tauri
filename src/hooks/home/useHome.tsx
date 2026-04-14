import useFileStore from "@/store/useFileStore";
import { sendErrorLog } from "@/utils/sendlog";
import { invoke } from "@tauri-apps/api/core";

export const useHome = () => {
    const history = useFileStore((state) => state.historyFiles);
    const setWorkFile = useFileStore((state) => state.setWorkFile);

    const addHistoryFiles = useFileStore((state) => state.addHistoryFiles);
    const path = useFileStore((state) => state.workFile);

    const calculateHistogramWithOffset = (
        positions: Float32Array, 
        axis: number, 
        offsetStore: [number, number, number],
        binCount: number = 30
        ) => {
        if (positions.length === 0) return [];

        const currentOffset = offsetStore[axis];
        let min = Infinity;
        let max = -Infinity;

        // 1. 找到该轴在相对坐标下的极值
        for (let i = axis; i < positions.length; i += 3) {
            if (positions[i] < min) min = positions[i];
            if (positions[i] > max) max = positions[i];
        }

        const range = max - min;
        const bins = new Uint32Array(binCount);
        // 防止 range 为 0 导致除以 0
        const safeRange = range === 0 ? 1 : range;
        const binSize = safeRange / binCount;

        // 2. 统计分布
        for (let i = axis; i < positions.length; i += 3) {
            const val = positions[i];
            let binIdx = Math.floor((val - min) / binSize);
            if (binIdx >= binCount) binIdx = binCount - 1;
            bins[binIdx]++;
        }

        // 3. 格式化返回：标签 (label) 需要还原真实坐标
        return Array.from(bins).map((count, i) => {
            // 计算该箱体对应的真实地理坐标
            const realCoord = min + i * binSize + currentOffset;
            return {
            // 这里的 x 轴显示的是还原后的真实值
            realValue: realCoord.toFixed(2), 
            count: count,
            };
        });
    };
    const handlePickFile = async () => {
        try {
            const cur: string = await invoke("pick_file_path");
                if (cur) {
                    setWorkFile(cur);
                    addHistoryFiles(cur);
                }
            } catch (err) {
                console.error("load file error:", err);
                sendErrorLog("load file error");
            }
    };

    return {
        history,
        setWorkFile,
        path,
        handlePickFile,
        calculateHistogramWithOffset
    }
}
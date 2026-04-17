import useFileStore from "@/store/useFileStore";
import { useLasStore } from "@/store/useLasStore";
import type { PointCloudData } from "@/types/las.types";
import { invoke } from "@tauri-apps/api/core";
import { Ruler, X } from "lucide-react";

const MeasurementToolbar = () => {
    const measurement = useLasStore((state) => state.measurement);
    const toggleMeasuring = useLasStore((state) => state.toggleMeasuring);
    const clearMeasurement = useLasStore((state) => state.clearMeasurement);
    const setCompareData = useLasStore((state) => state.setCompareLasPoints);

    const handleDownsample = async () => {
        const cur = await invoke<PointCloudData>("voxel_downsample_las", { voxelSize: 0.5 });
        setCompareData(cur);
    };

    const handleDenoise = async () => {
        try {
            const cur = await invoke<PointCloudData>("denoise_las", { threshold: 1.0 });
            setCompareData(cur);
        } catch (error) {
            console.error("去噪功能尚未实现:", error);
            alert("去噪功能后端尚未实现, 请先添加Rust函数 denoise_las");
        }
    };

    return (
        <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    点云测量
                </span>
            </div>
            <div className="flex-1" />
            <button
                onClick={toggleMeasuring}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    measurement.isMeasuring
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
            >
                {measurement.isMeasuring ? "停止测量" : "开始测量"}
            </button>
            <button
                onClick={clearMeasurement}
                className="px-3 py-1 rounded-md cursor-pointer text-sm font-medium bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 flex items-center gap-1"
            >
                <X className="w-4 h-4" />
                清除
            </button>
            <button
                onClick={handleDownsample}
                className="px-3 py-1 bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-white rounded-md text-sm font-medium"
            >
                降采样
            </button>
            <button
                onClick={handleDenoise}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium cursor-pointer"
            >
                去噪
            </button>
            <button
                onClick={() => {
                    useFileStore.getState().resetWorkFile();
                    useLasStore.getState().cleanCurrentLasPoints();
                    useLasStore.getState().cleanCompareLasPoints();
                }}
                className="px-3 py-1 bg-pink-500 hover:bg-pink-600 text-white rounded-md text-sm font-medium cursor-pointer"
            >
                清除文件
            </button>
        </div>
    );
};

export default MeasurementToolbar;
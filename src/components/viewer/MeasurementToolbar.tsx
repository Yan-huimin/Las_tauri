import { useState, useRef } from "react";
import useFileStore from "@/store/useFileStore";
import { useLasStore } from "@/store/useLasStore";
import type { PointCloudData } from "@/types/las.types";
import { invoke } from "@tauri-apps/api/core";
import { Ruler, X, Save } from "lucide-react";

const MeasurementToolbar = () => {
    const measurement = useLasStore((state) => state.measurement);
    const toggleMeasuring = useLasStore((state) => state.toggleMeasuring);
    const clearMeasurement = useLasStore((state) => state.clearMeasurement);
    const setCompareData = useLasStore((state) => state.setCompareLasPoints);

    const [voxelSize, setVoxelSize] = useState("0.5");
    const [kNeighbors, setKNeighbors] = useState("30");
    const [stdMul, setStdMul] = useState("1.0");
    const [saving, setSaving] = useState(false);
    const savingRef = useRef(false);

    const handleDownsample = async () => {
        const vSize = parseFloat(voxelSize) || 0.5;
        setCompareData(null);
        const cur = await invoke<PointCloudData>("voxel_downsample_las", { voxelSize: vSize });
        setCompareData(cur);
    };

    const handleDenoise = async () => {
        try {
            // const vSize = parseFloat(voxelSize) || 0.5;
            const k = parseInt(kNeighbors) || 15;
            const s = parseFloat(stdMul) || 1.0;

            // 清空对比数据
            setCompareData(null);

            const cur = await invoke<PointCloudData>("denoise_las", { kNeighbors: k, stdMul: s });
            setCompareData(cur);
        } catch (error) {
            console.error("去噪失败:", error);
            alert("去噪失败: " + error);
        }
    };

    const handleSave = async () => {
        if (savingRef.current) return;
        savingRef.current = true;
        setSaving(true);
        try {
            const path = await invoke<string>("save_las_file");
            alert("保存成功!\n" + path);
        } catch (error) {
            console.error("保存失败:", error);
            alert("保存失败: " + error);
        } finally {
            setSaving(false);
            savingRef.current = false;
        }
    };

    return (
        <div className="flex items-center gap-3 p-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex-wrap">
            <div className="flex items-center gap-2 px-2">
                <Ruler className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    点云处理
                </span>
            </div>
            <div className="flex-1" />
            <button
                onClick={toggleMeasuring}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    measurement.isMeasuring
                        ? "bg-red-500 hover:bg-red-600 text-white shadow-sm"
                        : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm"
                }`}
            >
                {measurement.isMeasuring ? "停止测量" : "开始测量"}
            </button>
            <button
                onClick={clearMeasurement}
                className="px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors"
            >
                <X className="w-3.5 h-3.5" />
                清除
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-600" />
            <div className="flex items-center gap-1.5">
                <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    value={voxelSize}
                    onChange={(e) => setVoxelSize(e.target.value)}
                    placeholder="体素"
                    title="体素大小"
                    className="w-16 px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
                <button
                    onClick={handleDownsample}
                    className="px-2.5 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg text-xs font-medium cursor-pointer transition-all shadow-sm"
                >
                    降采样
                </button>
            </div>
            <div className="flex items-center gap-1.5">
                <input
                    type="number"
                    min="1"
                    value={kNeighbors}
                    onChange={(e) => setKNeighbors(e.target.value)}
                    placeholder="K"
                    title="邻域点数"
                    className="w-14 px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                />
                <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={stdMul}
                    onChange={(e) => setStdMul(e.target.value)}
                    placeholder="σ"
                    title="标准差倍数"
                    className="w-14 px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                />
                <button
                    onClick={handleDenoise}
                    className="px-2.5 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg text-xs font-medium cursor-pointer transition-all shadow-sm"
                >
                    去噪
                </button>
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-600" />
            <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-indigo-300 disabled:to-purple-300 text-white rounded-lg text-xs font-medium cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-sm"
            >
                <Save className={`w-3.5 h-3.5 ${saving ? "animate-spin" : ""}`} />
                {saving ? "保存中..." : "保存"}
            </button>
            <button
                onClick={() => {
                    useFileStore.getState().resetWorkFile();
                    useLasStore.getState().cleanCurrentLasPoints();
                    useLasStore.getState().cleanCompareLasPoints();
                }}
                className="px-2.5 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg text-xs font-medium cursor-pointer transition-all shadow-sm"
            >
                清除文件
            </button>
        </div>
    );
};

export default MeasurementToolbar;
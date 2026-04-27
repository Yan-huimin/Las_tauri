import { useState } from "react";
import { LasViewer } from "@/components/home/show/lasviewer";
import MeasurementPanel from "@/components/viewer/MeasurementPanel";
import MeasurementToolbar from "@/components/viewer/MeasurementToolbar";
import { useLasStore } from "@/store/useLasStore";
import { Eye, Layers } from "lucide-react";

const ViewerPanel = ({ title, icon: Icon, data, target, accent }: {
    title: string;
    icon: typeof Eye;
    data: any;
    target: "current" | "compare";
    accent: string;
}) => (
    <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 shadow-sm">
        <div className={`flex items-center gap-2 px-4 py-2 text-xs font-medium ${accent} border-b border-slate-100 dark:border-slate-700/50`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{title}</span>
        </div>
        <div className="flex-1 relative">
            <LasViewer data={data} target={target} />
        </div>
    </div>
);

const View = () => {
    const [showPanel, setShowPanel] = useState(true);
    const data = useLasStore((state) => state.currentPoint);
    const compareData = useLasStore((state) => state.comparePoint);

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#15161e] dark:to-[#1a1b26]">
            {/* 顶部导航 */}
            <header className="flex-shrink-0 flex items-center justify-between px-5 h-14 bg-white/70 dark:bg-[#1e1f2e]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Layers className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                        点云查看器
                    </h1>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <span className="hidden sm:inline">拖拽旋转 · 滚轮缩放</span>
                </div>
            </header>

            <main className="flex-1 flex w-full h-full overflow-hidden">
                {/* 左侧：点云查看器区域 */}
                <div className="flex-1 flex flex-col h-full p-3 gap-3 min-w-0">
                    {/* 测量工具栏 */}
                    <MeasurementToolbar />

                    {/* 点云查看器容器 */}
                    <div className="flex-1 flex gap-3 overflow-hidden">
                        <ViewerPanel
                            title="原始点云"
                            icon={Eye}
                            data={data}
                            target="current"
                            accent="text-emerald-600 dark:text-emerald-400"
                        />
                        <ViewerPanel
                            title="处理后点云"
                            icon={Layers}
                            data={compareData}
                            target="compare"
                            accent="text-indigo-600 dark:text-indigo-400"
                        />
                    </div>
                </div>

                {/* 右侧：测量面板区域（始终占用 w-80 空间） */}
                <div className="w-80 h-full py-3 pr-3 pl-0 border-l border-slate-200/60 dark:border-slate-700/50">
                    {showPanel ? (
                        <div className="h-full overflow-y-auto">
                            <MeasurementPanel onClose={() => setShowPanel(false)} />
                        </div>
                    ) : (
                        <div className="h-full flex items-start justify-center pt-8">
                            <button
                                onClick={() => setShowPanel(true)}
                                className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                            >
                                打开面板
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default View;

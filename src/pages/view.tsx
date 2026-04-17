import Navbar from "@/components/base/navbar";
import { LasViewer } from "@/components/home/show/lasviewer";
import MeasurementPanel from "@/components/viewer/MeasurementPanel";
import MeasurementToolbar from "@/components/viewer/MeasurementToolbar";
import { useLasStore } from "@/store/useLasStore";
import type { PointCloudData } from "@/types/las.types";
import { invoke } from "@tauri-apps/api/core";
// import { useLasViewer } from "@/hooks/viewer/useLasViewer";
// import { useLasStore } from "@/store/useLasStore";

const View = () => {

    const data = useLasStore((state) => state.currentPoint);
    const compareData = useLasStore((state) => state.comparePoint);

    return (<>
        <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-100 dark:bg-[#1E1F27]">
            <Navbar title="View" />
            
            <main className="flex-1 flex w-full h-full overflow-hidden">
                {/* 左侧：点云查看器区域 */}
                <div className="flex-1 flex flex-col h-full p-2 gap-2">
                    {/* 测量工具栏 */}
                    <MeasurementToolbar />

                    {/* 点云查看器容器 */}
                    <div className="flex-1 flex gap-2 overflow-hidden">
                        <div className="flex-1 h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <LasViewer data={data} target="current" />
                        </div>
                        <div className="flex-1 h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <LasViewer data={compareData} target="compare" />
                        </div>
                    </div>
                </div>

                {/* 右侧：测量面板 */}
                <div className="w-80 h-full p-2 border-l border-slate-200 dark:border-slate-700 overflow-y-auto">
                    <MeasurementPanel />
                </div>
            </main>
        </div>
    </>);
}

export default View;

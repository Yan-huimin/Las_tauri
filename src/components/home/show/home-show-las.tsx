import { LasViewer } from "./lasviewer";
import { useLasStore } from "@/store/useLasStore";

const HomeShowLas = () => {
    const currentPoint = useLasStore((state) => state.currentPoint);

    // 如果没有数据，显示空状态
    if (!currentPoint) {
        return (
            <div className="w-auto h-full overflow-y-auto rounded-md flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">
                    暂无点云数据
                </div>
            </div>
        );
    }

    return (
        <div className="w-auto h-full overflow-y-auto rounded-md">
            <LasViewer data={currentPoint} instanceId="home-show" />
        </div>
    );
};

export default HomeShowLas;